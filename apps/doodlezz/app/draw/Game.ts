import { Shape, ShapeType } from "@/types/types";
import { getExistingShapes } from "./http";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number;
  private startY: number;
  private lastX: number;
  private lastY:number;
  private selectedTool = ShapeType.RECT;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY=0;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setShape(tool: ShapeType) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (ev) => {
      const receivedMsg = JSON.parse(ev.data);
      console.log(receivedMsg);

      if (receivedMsg.type === "chat") {
        const parsedShape = JSON.parse(receivedMsg.payload.text);
        this.existingShapes.push(parsedShape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((s) => {
      this.ctx.strokeStyle = "white";

      if (s.type === ShapeType.RECT) {
        this.ctx.strokeRect(s.x, s.y, s.width, s.height);
      } else if (s.type === ShapeType.CIRCLE) {
        this.drawCircle(s.x, s.y, s.width, s.height);
      }
    });
  }

  
  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = this.startX;
    this.lastY = this.startY;

        if (this.selectedTool === ShapeType.PENCIL) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
  
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    let shape: Shape | null = null;
    if (this.selectedTool === ShapeType.RECT) {
      shape = {
        type: this.selectedTool,
        x: this.startX,
        y: this.startY,
        height: height,
        width: width,
      };
    } else if (this.selectedTool === ShapeType.CIRCLE) {
      shape = {
        type: ShapeType.CIRCLE,
        x: this.startX,
        y: this.startY,
        height: height,
        width: width,
      };
    } else if (this.selectedTool === ShapeType.PENCIL) {
      shape = {
        type: ShapeType.PENCIL,
        startX: this.startX,
        startY: this.startY,
        endX: this.startX,
        endY: this.startY,
      };
    } else if (this.selectedTool === ShapeType.Eraser) {
      shape = {
        type: ShapeType.Eraser,
        startX: this.startX,
        startY: this.startY,
        endX: this.startX,
        endY: this.startY,
      };
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: JSON.stringify(shape),
          roomId: this.roomId,
        },
      }),
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return
    
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

    //   this.ctx.strokeStyle = "white";

      if (this.selectedTool === ShapeType.RECT) {
      this.clearCanvas();
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (this.selectedTool === ShapeType.CIRCLE) {
      this.clearCanvas();

        this.drawCircle(this.startX, this.startY, width, height);
      }else if (this.selectedTool === ShapeType.PENCIL){
      this.clearCanvas();
        this.ctx.globalCompositeOperation="source-over";
        this.ctx.lineTo(e.clientX,e.clientY);
        this.ctx.stroke();     
      } else {
        this.ctx.globalCompositeOperation="destination-out";
        this.ctx.beginPath();
        this.ctx.arc(this.lastX,this.lastY,8,0,Math.PI*2,false);
        this.ctx.fill();
      }
      this.lastX=e.clientX
      this.lastY=e.clientY
    
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  drawCircle(x: number, y: number, width: number, height: number) {
    var kappa = 0.5522848,
      ox = (width / 2) * kappa, // control point offset horizontal
      oy = (height / 2) * kappa, // control point offset vertical
      xe = x + width, // x-end
      ye = y + height, // y-end
      xm = x + width / 2, // x-middle
      ym = y + height / 2; // y-middle

    this.ctx.beginPath();
    this.ctx.moveTo(x, ym);
    this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.ctx.stroke();
  }
}