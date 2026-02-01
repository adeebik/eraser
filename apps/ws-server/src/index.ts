import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-config/config";

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map<string, Set<WebSocket>>();

type userInfo = {
  room: string;
  name: string;
  userId: string;
};

const users = new Map<WebSocket, userInfo>();

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.id) {
      return null;
    }
    return decoded.id;
  } catch (error) {
    console.log(error);

    return null;
  }
}

wss.on("connection", (ws, request) => {
  console.log("New client connected");

  ws.on("error", (e) => {
    console.log("Error occurred :", e);
  });

  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (!userId) {
    return;
  }

  ws.on("message", (raw) => {
    try {
      const parsedData = JSON.parse(raw.toString());

      if (parsedData.type === "create") {
        const { roomId, name } = parsedData.payload;

        if (!roomId || !name) {
          return ws.send(
            JSON.stringify({
              type: "error",
              text: "Invalid room ID or name",
            }),
          );
        }

        if (rooms.has(roomId)) {
          const data = JSON.stringify({
            type: "error",
            text: "Room already exist, Please Join",
          });
          return ws.send(data);
        }

        rooms.set(roomId, new Set());
        rooms.get(roomId)?.add(ws);
        users.set(ws, { room: roomId, name, userId });

        const createData = JSON.stringify({
          type: "system",
          text: `${name} created & joined the room`,
          payload: {
            userId: userId,
            name: name,
          },
        });

        ws.send(createData);

        ws.send(
          JSON.stringify({
            type: "created",
            payload: { roomId, name, userId },
          }),
        );

        return;
      }

      if (parsedData.type === "join") {
        const { roomId, name } = parsedData.payload;

        if (!roomId || !name) {
          return ws.send(
            JSON.stringify({
              type: "error",
              text: "Invalid room ID or name",
            }),
          );
        }

        if (!rooms.has(roomId)) {
          const data = JSON.stringify({
            type: "error",
            text: "Room does not exist.",
          });
          return ws.send(data);
        }

        rooms.get(roomId)?.add(ws);
        users.set(ws, { room: roomId, name, userId });

        const JoinData = JSON.stringify({
          type: "system",
          text: `${name} joined the room`,
          payload: {
            userId: userId,
            name: name,
          },
        });

        rooms.get(roomId)?.forEach((socket) => {
          socket.send(JoinData);
        });

        ws.send(
          JSON.stringify({
            type: "joined",
            payload: { roomId, name },
          }),
        );

        return;
      }

      if (parsedData.type === "leave") {
        const { roomId, name } = parsedData.payload;

        //roomSet will have all the set of webockets present in that roomid
        const roomSet = rooms.get(roomId);
        if (roomSet) {
          roomSet.delete(ws);
          const leaveData = JSON.stringify({
            type: "system",
            text: `${name} left the room`,
          });
          roomSet.forEach((member) => {
            if (member !== ws) {
              member.send(leaveData);
            }
          });
        }
      }

      if (parsedData.type === "delete") {
        //check if the userId here created the room
        // if yes then
        // rooms.delete(roomId);
        // console.log();
      }

      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message = parsedData.message;

        if (!roomId) return;

        const data = JSON.stringify({
          type: "chat",
          payload: {
            userId,
            text: message,
            roomId,
          },
        });

        rooms.get(roomId)?.forEach((member) => {
          if (member !== ws) {
            member.send(data);
          }
        });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          text: "Invalid message format",
        }),
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
