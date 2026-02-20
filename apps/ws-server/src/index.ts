import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-config/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type UserInfo = {
  roomId: string;
  name: string;
  userId: string;
  ws: WebSocket | null; // null when offline
  lastSeen: Date;
};

type RoomInfo = {
  roomId: string;
  adminId: string;
  createdAt: Date;
  members: Map<string, UserInfo>; // userId -> UserInfo
};

// ============================================================================
// DATA STORES
// ============================================================================

const rooms = new Map<string, RoomInfo>();
const activeConnections = new Map<WebSocket, string>(); // ws -> userId

// ============================================================================
// CLEANUP - Remove empty rooms and long-offline users
// ============================================================================

setInterval(
  () => {
    const now = new Date();
    const OFFLINE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    rooms.forEach((roomInfo, roomId) => {
      // Remove users who've been offline for too long
      roomInfo.members.forEach((member, userId) => {
        if (
          member.ws === null &&
          now.getTime() - member.lastSeen.getTime() > OFFLINE_TIMEOUT
        ) {
          console.log(
            `🧹 Removing offline user ${member.name} from room ${roomId}`,
          );
          roomInfo.members.delete(userId);
        }
      });

      // Remove empty rooms
      if (roomInfo.members.size === 0) {
        console.log(`🧹 Removing empty room ${roomId}`);
        rooms.delete(roomId);
      }
    });
  },
  5 * 60 * 1000,
); // Run cleanup every 5 minutes

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (typeof decoded === "string") return null;
    if (!decoded || !decoded.id) return null;
    return decoded.id;
  } catch (error) {
    console.log("Auth error:", error);
    return null;
  }
}

function broadcastToRoom(
  roomId: string,
  message: string,
  excludeUserId?: string,
) {
  const roomInfo = rooms.get(roomId);
  if (!roomInfo) return;

  roomInfo.members.forEach((member, userId) => {
    if (
      userId !== excludeUserId &&
      member.ws &&
      member.ws.readyState === WebSocket.OPEN
    ) {
      member.ws.send(message);
    }
  });
}

// ============================================================================
// WEBSOCKET SERVER
// ============================================================================

wss.on("connection", (ws, request) => {
  console.log("🔌 New client connected");

  ws.on("error", (e) => {
    console.log("❌ Error occurred:", e);
  });

  const url = request.url;
  if (!url) {
    ws.close(1008, "missing URL");
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (!userId) {
    ws.close(1008, "invalid token");
    return;
  }

  activeConnections.set(ws, userId);

  // ========================================================================
  // AUTO-RECONNECT: Check if user is already in a room
  // ========================================================================
  for (const [roomId, roomInfo] of rooms.entries()) {
    const member = roomInfo.members.get(userId);
    if (member) {
      // User is reconnecting!
      member.ws = ws;
      member.lastSeen = new Date();

      ws.send(
        JSON.stringify({
          type: "reconnected",
          payload: {
            roomId,
            userName: member.name,
            isAdmin: roomInfo.adminId === userId,
          },
        }),
      );

      // Notify others user is back online
      broadcastToRoom(
        roomId,
        JSON.stringify({
          type: "user-online",
          payload: { userId, name: member.name },
        }),
        userId,
      );

      console.log(`🔄 ${member.name} reconnected to room ${roomId}`);
      break;
    }
  }

  ws.on("message", async (raw) => {
    try {
      const parsedData = JSON.parse(raw.toString());

      // ====================================================================
      // JOIN ROOM
      // ====================================================================
      if (parsedData.type === "join") {
        let { roomId, name } = parsedData.payload;

        if (!roomId) {
          return ws.send(
            JSON.stringify({ type: "error", text: "Invalid room ID" }),
          );
        }

        // Verify membership in database
        const roomFromDb = await prisma.room.findFirst({
          where: { id: roomId },
          include: {
            members: { where: { userId: userId } },
          },
        });

        if (!roomFromDb) {
          return ws.send(
            JSON.stringify({ type: "error", text: "Room does not exist" }),
          );
        }

        const isMember =
          roomFromDb.adminId === userId || roomFromDb.members.length > 0;
        if (!isMember) {
          return ws.send(
            JSON.stringify({ type: "error", text: "Access denied" }),
          );
        }

        // Get user name from DB
        const user = await prisma.user.findFirst({
          where: { id: userId },
          select: { name: true },
        });
        if (user) name = user.name;

        // Initialize room in memory if not exists
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            roomId,
            adminId: roomFromDb.adminId,
            createdAt: roomFromDb.createdAt,
            members: new Map(),
          });
        }

        const roomInfo = rooms.get(roomId)!;

        // Add or update user in room
        if (roomInfo.members.has(userId)) {
          // Update existing member (reconnection case)
          const member = roomInfo.members.get(userId)!;
          member.ws = ws;
          member.lastSeen = new Date();
        } else {
          // Add new member
          roomInfo.members.set(userId, {
            roomId,
            name: name || "Unknown",
            userId,
            ws,
            lastSeen: new Date(),
          });
        }

        // Notify all members
        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "user-joined",
            payload: { userId, name },
          }),
        );

        ws.send(
          JSON.stringify({
            type: "joined",
            payload: {
              roomId,
              userName: name,
              isAdmin: roomInfo.adminId === userId,
            },
          }),
        );

        console.log(`✅ ${name} joined room ${roomId}`);
        return;
      }

      // ====================================================================
      // LEAVE ROOM (User explicitly leaves - remove from members)
      // ====================================================================
      if (parsedData.type === "leave") {
        const { roomId } = parsedData.payload;

        const roomInfo = rooms.get(roomId);
        if (!roomInfo) return;

        const member = roomInfo.members.get(userId);
        if (!member) return;

        // Remove from room
        roomInfo.members.delete(userId);

        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "user-left",
            payload: { userId, name: member.name },
          }),
        );

        ws.send(
          JSON.stringify({
            type: "left",
            payload: { roomId },
          }),
        );

        console.log(`👋 ${member.name} left room ${roomId}`);
        return;
      }

      // ====================================================================
      // CHAT (Add new shape)
      // ====================================================================
      if (parsedData.type === "chat") {
        const { message, roomId } = parsedData.payload;
        
        await prisma.chat.create({
          data: {
            roomId: roomId,
            message: message,
            userId: userId,
          },
        });

        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "chat",
            payload: { message, roomId },
          }),
          userId,
        );
        return;
      }

      // ====================================================================
      // UPDATE (Modify existing shape properties)
      // ====================================================================
      if (parsedData.type === "update") {
        const { shapeIndex, shape, roomId } = parsedData.payload;

        // Find the chat at the specific index, ordered by ID.
        // This matches the frontend's array index.
        const chats = await prisma.chat.findMany({
          where: { roomId: roomId },
          orderBy: { id: "asc" },
        });

        if (chats[shapeIndex]) {
          await prisma.chat.update({
            where: { id: chats[shapeIndex].id },
            data: { message: shape },
          });
        }

        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "update",
            payload: { shapeIndex, shape, roomId },
          }),
          userId,
        );
        return;
      }

      // ====================================================================
      // STATE_SYNC (Undo/Redo or Deletes)
      // ====================================================================
      if (parsedData.type === "state_sync") {
        const { shapes, roomId } = parsedData.payload;

        // Wipe and replace all shapes for this room
        await prisma.chat.deleteMany({
          where: { roomId: roomId },
        });

        const parsedShapes = JSON.parse(shapes);
        if (parsedShapes.length > 0) {
          await prisma.chat.createMany({
            data: parsedShapes.map((s: any) => ({
              roomId: roomId,
              message: JSON.stringify(s),
              userId: userId,
            })),
          });
        }

        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "state_sync",
            payload: { shapes, roomId },
          }),
          userId,
        );
        return;
      }

      // ====================================================================
      // CLEAR_CANVAS
      // ====================================================================
      if (parsedData.type === "clear_canvas") {
        const { roomId } = parsedData.payload;

        await prisma.chat.deleteMany({
          where: { roomId: roomId },
        });

        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "clear_canvas",
            payload: { roomId },
          }),
          userId,
        );
        return;
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
      ws.send(
        JSON.stringify({ type: "error", text: "Invalid message format" }),
      );
    }
  });

  // ========================================================================
  // DISCONNECT: Mark user as offline (but keep in room)
  // ========================================================================
  ws.on("close", () => {
    console.log("🔌 Client disconnected");

    const disconnectedUserId = activeConnections.get(ws);
    if (!disconnectedUserId) return;

    // Mark user as offline in all rooms
    for (const [roomId, roomInfo] of rooms.entries()) {
      const member = roomInfo.members.get(disconnectedUserId);
      if (member) {
        member.ws = null; // ✅ Keep in room, just mark offline
        member.lastSeen = new Date();

        // Notify others user went offline
        broadcastToRoom(
          roomId,
          JSON.stringify({
            type: "user-offline",
            payload: { userId: disconnectedUserId, name: member.name },
          }),
          disconnectedUserId,
        );

        console.log(`📴 ${member.name} went offline in room ${roomId}`);
        break;
      }
    }

    activeConnections.delete(ws);
  });
});

console.log("🚀 WebSocket server running on port 8080");
console.log(
  "♻️ Auto-cleanup: Removes users offline >30min, empty rooms every 5min",
);
