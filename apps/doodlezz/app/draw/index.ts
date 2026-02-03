import { BE_URL } from "../../config/config";
import axios from "axios";

enum ShapeType {
  RECT = "rect",
  CIRCLE = "circle",
}

type Shape = {
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function initDraw(canvasRef: HTMLCanvasElement, roomId: string, socket:WebSocket) {
  let existingShapes: Shape[] = await getExistingShapes(roomId);

  const canvas = canvasRef;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    existingShapes.push({
      x: startX,
      y: startY,
      height: height,
      width: width,
      type: ShapeType.RECT,
    });
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      clearCanvas(existingShapes, canvas, ctx);

      ctx.strokeStyle = "white";
      ctx.strokeRect(startX, startY, width, height);
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of existingShapes) {
    if (s.type === ShapeType.RECT) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(s.x, s.y, s.width, s.height);
    }
  }
}

async function getExistingShapes(roomId: string) {
  try {
    const res = await axios.get(`${BE_URL}/chats/${roomId}`);
    const data = res.data;

    const shapes = data.map((x: { msg: string }) => {
      const msgData = JSON.parse(x.msg);
      return msgData;
    });

    return shapes;
  } catch (error) {
    console.log(error);
    return [];
  }
}
