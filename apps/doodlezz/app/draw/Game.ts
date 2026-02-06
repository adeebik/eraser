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
  private lastY: number;
  private selectedTool = ShapeType.RECT;
  private currentPath: {x: number, y: number}[] = [];

  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isPanning: boolean = false;
  private panStartX: number = 0;
  private panStartY: number = 0;
  private minScale: number = 0.1;
  private maxScale: number = 10;

  private history: Shape[][] = [];
  private historyStep: number = -1;
  private maxHistorySize: number = 50;

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
    this.lastY = 0;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.initZoomHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
  }

  setShape(tool: ShapeType) {
    this.selectedTool = tool;
  }

  private screenToCanvas(screenX: number, screenY: number): {x: number, y: number} {
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenX - rect.left - this.offsetX) / this.scale;
    const y = (screenY - rect.top - this.offsetY) / this.scale;
    return { x, y };
  }

  private zoomAtPoint(newScale: number, screenX: number, screenY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = screenX - rect.left;
    const mouseY = screenY - rect.top;

    const canvasX = (mouseX - this.offsetX) / this.scale;
    const canvasY = (mouseY - this.offsetY) / this.scale;

    this.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

    this.offsetX = mouseX - canvasX * this.scale;
    this.offsetY = mouseY - canvasY * this.scale;

    this.clearCanvas();
  }

  public zoomIn() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.zoomAtPoint(this.scale * 1.2, centerX, centerY);
  }

  public zoomOut() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.zoomAtPoint(this.scale / 1.2, centerX, centerY);
  }

  public resetZoom() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.clearCanvas();
  }

  public getZoomLevel(): number {
    return Math.round(this.scale * 100);
  }

  private saveToHistory() {
    this.history = this.history.slice(0, this.historyStep + 1);
    
    this.history.push([...this.existingShapes]);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyStep++;
    }
  }

  public undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.existingShapes = [...this.history[this.historyStep]];
      this.clearCanvas();
    }
  }

  public redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.existingShapes = [...this.history[this.historyStep]];
      this.clearCanvas();
    }
  }

  public canUndo(): boolean {
    return this.historyStep > 0;
  }

  public canRedo(): boolean {
    return this.historyStep < this.history.length - 1;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.saveToHistory();
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
    this.ctx.save();

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    this.drawGrid();

    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2 / this.scale;
    
    this.existingShapes.forEach((s) => {
      if (s.type === ShapeType.Eraser) return;

      if (s.type === ShapeType.RECT) {
        this.ctx.strokeRect(s.x, s.y, s.width, s.height);
      } else if (s.type === ShapeType.CIRCLE) {
        this.drawCircle(s.x, s.y, s.width, s.height);
      } else if (s.type === ShapeType.PENCIL && s.path) {
        this.drawPath(s.path);
      }
    });

    this.existingShapes.forEach((s) => {
      if (s.type === ShapeType.Eraser && s.erasePoints) {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillStyle = "white";
        
        s.erasePoints.forEach(point => {
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, 8 / this.scale, 0, Math.PI * 2);
          this.ctx.fill();
        });
        
        this.ctx.globalCompositeOperation = "source-over";
      }
    });

    this.ctx.restore();
  }

  private drawGrid() {
    const gridSize = 50;
    const startX = Math.floor(-this.offsetX / this.scale / gridSize) * gridSize;
    const startY = Math.floor(-this.offsetY / this.scale / gridSize) * gridSize;
    const endX = startX + (this.canvas.width / this.scale) + gridSize;
    const endY = startY + (this.canvas.height / this.scale) + gridSize;

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1 / this.scale;

    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
  }

  private drawPath(path: {x: number, y: number}[]) {
    if (path.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x, path[i].y);
    }
    this.ctx.stroke();
  }

  mouseDownHandler = (e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isPanning = true;
      this.panStartX = e.clientX - this.offsetX;
      this.panStartY = e.clientY - this.offsetY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    this.clicked = true;
    const coords = this.screenToCanvas(e.clientX, e.clientY);
    this.startX = coords.x;
    this.startY = coords.y;
    this.lastX = this.startX;
    this.lastY = this.startY;

    if (this.selectedTool === ShapeType.PENCIL) {
      this.currentPath = [{x: this.startX, y: this.startY}];
    } else if (this.selectedTool === ShapeType.Eraser) {
      this.currentPath = [{x: this.startX, y: this.startY}];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "default";
      return;
    }

    if (!this.clicked) return;
    this.clicked = false;

    const coords = this.screenToCanvas(e.clientX, e.clientY);
    const width = coords.x - this.startX;
    const height = coords.y - this.startY;

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
        path: this.currentPath,
      };
    } else if (this.selectedTool === ShapeType.Eraser) {
      shape = {
        type: ShapeType.Eraser,
        erasePoints: this.currentPath,
      };
    }

    if (!shape) {
      this.currentPath = [];
      return;
    }

    this.existingShapes.push(shape);
    this.saveToHistory();

    this.socket.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: JSON.stringify(shape),
          roomId: this.roomId,
        },
      }),
    );

    this.currentPath = [];
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.offsetX = e.clientX - this.panStartX;
      this.offsetY = e.clientY - this.panStartY;
      this.clearCanvas();
      return;
    }

    if (!this.clicked) return;

    const coords = this.screenToCanvas(e.clientX, e.clientY);
    const width = coords.x - this.startX;
    const height = coords.y - this.startY;

    if (this.selectedTool === ShapeType.RECT) {
      this.clearCanvas();
      this.ctx.save();
      this.ctx.translate(this.offsetX, this.offsetY);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2 / this.scale;
      this.ctx.strokeRect(this.startX, this.startY, width, height);
      this.ctx.restore();
    } else if (this.selectedTool === ShapeType.CIRCLE) {
      this.clearCanvas();
      this.ctx.save();
      this.ctx.translate(this.offsetX, this.offsetY);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2 / this.scale;
      this.drawCircle(this.startX, this.startY, width, height);
      this.ctx.restore();
    } else if (this.selectedTool === ShapeType.PENCIL) {
      this.currentPath.push({x: coords.x, y: coords.y});
      this.ctx.save();
      this.ctx.translate(this.offsetX, this.offsetY);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2 / this.scale;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.stroke();
      this.ctx.restore();
    } else if (this.selectedTool === ShapeType.Eraser) {
      this.currentPath.push({x: coords.x, y: coords.y});
      this.ctx.save();
      this.ctx.translate(this.offsetX, this.offsetY);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.beginPath();
      this.ctx.arc(coords.x, coords.y, 8 / this.scale, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    this.lastX = coords.x;
    this.lastY = coords.y;
  };

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      const zoomIntensity = 0.1;
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      const newScale = this.scale * (1 + delta);
      this.zoomAtPoint(newScale, e.clientX, e.clientY);
    }
    else if (e.shiftKey) {
      const scrollSpeed = 1;
      this.offsetX -= e.deltaY * scrollSpeed;
      this.clearCanvas();
    }
    else {
      const scrollSpeed = 1;
      this.offsetY -= e.deltaY * scrollSpeed;
      this.clearCanvas();
    }
  };

  initZoomHandlers() {
    this.canvas.addEventListener("wheel", this.wheelHandler, { passive: false });
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  drawCircle(x: number, y: number, width: number, height: number) {
    const kappa = 0.5522848;
    const ox = (width / 2) * kappa;
    const oy = (height / 2) * kappa;
    const xe = x + width;
    const ye = y + height;
    const xm = x + width / 2;
    const ym = y + height / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(x, ym);
    this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.ctx.stroke();
  }
}