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

  // Zoom and Pan properties
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private isPanning: boolean = false;
  private panStartX: number = 0;
  private panStartY: number = 0;
  private minScale: number = 0.1;
  private maxScale: number = 10;

  // Undo/Redo properties - separated for local and collaborative actions
  private localHistory: Shape[][] = [];
  private localHistoryStep: number = -1;
  private maxHistorySize: number = 50;
  private isRemoteUpdate: boolean = false; // Flag to track remote updates

  // Selection and drag properties
  private selectedShapeIndex: number | null = null;
  private isDragging: boolean = false;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;
  private isResizing: boolean = false;
  private isRotating: boolean = false;
  private resizeHandle: string | null = null;
  private rotationHandle: boolean = false;
  private initialRotation: number = 0;

  // Event listeners for state changes
  private stateChangeListeners: (() => void)[] = [];

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

  // Subscribe to state changes
  public onStateChange(callback: () => void) {
    this.stateChangeListeners.push(callback);
  }

  // Notify all listeners of state change
  private notifyStateChange() {
    this.stateChangeListeners.forEach(callback => callback());
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    this.stateChangeListeners = [];
  }

  setShape(tool: ShapeType) {
    this.selectedTool = tool;
  }

  // Convert screen coordinates to canvas coordinates (accounting for zoom and pan)
  private screenToCanvas(screenX: number, screenY: number): {x: number, y: number} {
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenX - rect.left - this.offsetX) / this.scale;
    const y = (screenY - rect.top - this.offsetY) / this.scale;
    return { x, y };
  }

  // Zoom to a specific point
  private zoomAtPoint(newScale: number, screenX: number, screenY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = screenX - rect.left;
    const mouseY = screenY - rect.top;

    // Calculate the canvas position before zoom
    const canvasX = (mouseX - this.offsetX) / this.scale;
    const canvasY = (mouseY - this.offsetY) / this.scale;

    // Update scale
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

    // Adjust offset to keep the same point under the mouse
    this.offsetX = mouseX - canvasX * this.scale;
    this.offsetY = mouseY - canvasY * this.scale;

    this.clearCanvas();
    this.notifyStateChange(); // Notify zoom level changed
  }

  // Public methods for zoom controls
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
    this.notifyStateChange();
  }

  public getZoomLevel(): number {
    return Math.round(this.scale * 100);
  }

  // Undo/Redo methods - only save local actions
  private saveToHistory() {
    // Don't save remote updates to local undo/redo history
    if (this.isRemoteUpdate) {
      return;
    }

    // Remove any history after current step (when user makes new action after undo)
    this.localHistory = this.localHistory.slice(0, this.localHistoryStep + 1);
    
    // Add current state to history
    this.localHistory.push(JSON.parse(JSON.stringify(this.existingShapes)));
    
    // Limit history size
    if (this.localHistory.length > this.maxHistorySize) {
      this.localHistory.shift();
    } else {
      this.localHistoryStep++;
    }

    this.notifyStateChange(); // Notify history state changed
  }

  public undo() {
    if (this.localHistoryStep > 0) {
      this.localHistoryStep--;
      this.existingShapes = JSON.parse(JSON.stringify(this.localHistory[this.localHistoryStep]));
      this.clearCanvas();
      this.notifyStateChange();
      
      // Broadcast the entire state to sync with other users
      this.broadcastUndo();
    }
  }

  public redo() {
    if (this.localHistoryStep < this.localHistory.length - 1) {
      this.localHistoryStep++;
      this.existingShapes = JSON.parse(JSON.stringify(this.localHistory[this.localHistoryStep]));
      this.clearCanvas();
      this.notifyStateChange();
      
      // Broadcast the entire state to sync with other users
      this.broadcastRedo();
    }
  }

  private broadcastUndo() {
    // Send the current state after undo
    this.socket.send(
      JSON.stringify({
        type: "state_sync",
        payload: {
          shapes: JSON.stringify(this.existingShapes),
          roomId: this.roomId,
        },
      }),
    );
  }

  private broadcastRedo() {
    // Send the current state after redo
    this.socket.send(
      JSON.stringify({
        type: "state_sync",
        payload: {
          shapes: JSON.stringify(this.existingShapes),
          roomId: this.roomId,
        },
      }),
    );
  }

  public canUndo(): boolean {
    return this.localHistoryStep > 0;
  }

  public canRedo(): boolean {
    return this.localHistoryStep < this.localHistory.length - 1;
  }

  // Selection helpers
  private isPointInShape(x: number, y: number, shape: Shape): boolean {
    if (shape.type === ShapeType.RECT) {
      const left = Math.min(shape.x, shape.x + shape.width);
      const right = Math.max(shape.x, shape.x + shape.width);
      const top = Math.min(shape.y, shape.y + shape.height);
      const bottom = Math.max(shape.y, shape.y + shape.height);
      return x >= left && x <= right && y >= top && y <= bottom;
    } else if (shape.type === ShapeType.CIRCLE) {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      const radiusX = Math.abs(shape.width / 2);
      const radiusY = Math.abs(shape.height / 2);
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      return (dx * dx + dy * dy) <= 1;
    } else if (shape.type === ShapeType.PENCIL && shape.path) {
      // Check if point is near any segment of the path
      const threshold = 10 / this.scale;
      for (let i = 0; i < shape.path.length - 1; i++) {
        const dist = this.distanceToLineSegment(
          x, y,
          shape.path[i].x, shape.path[i].y,
          shape.path[i + 1].x, shape.path[i + 1].y
        );
        if (dist < threshold) return true;
      }
      return false;
    }
    return false;
  }

  private distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;
    
    return Math.sqrt((px - nearestX) * (px - nearestX) + (py - nearestY) * (py - nearestY));
  }

  private findShapeAtPoint(x: number, y: number): number | null {
    // Search from top to bottom (reverse order) to get topmost shape
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];
      if (shape.type !== ShapeType.Eraser && this.isPointInShape(x, y, shape)) {
        return i;
      }
    }
    return null;
  }

  private moveShape(shapeIndex: number, deltaX: number, deltaY: number) {
    const shape = this.existingShapes[shapeIndex];
    
    if (shape.type === ShapeType.RECT || shape.type === ShapeType.CIRCLE) {
      shape.x += deltaX;
      shape.y += deltaY;
    } else if (shape.type === ShapeType.PENCIL && shape.path) {
      // Update path points
      shape.path = shape.path.map(point => ({
        x: point.x + deltaX,
        y: point.y + deltaY
      }));
      
      // Update center if it exists (for rotation)
      if (shape.centerX !== undefined && shape.centerY !== undefined) {
        shape.centerX += deltaX;
        shape.centerY += deltaY;
      }
    }
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.saveToHistory(); // Save initial state
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (ev) => {
      const receivedMsg = JSON.parse(ev.data);
      console.log(receivedMsg);

      // Mark as remote update to prevent adding to local history
      this.isRemoteUpdate = true;

      if (receivedMsg.type === "chat") {
        const parsedShape = JSON.parse(receivedMsg.payload.text);
        this.existingShapes.push(parsedShape);
        this.clearCanvas();
      } else if (receivedMsg.type === "update") {
        // Handle shape updates from other users
        const { shapeIndex, shape } = receivedMsg.payload;
        const parsedShape = JSON.parse(shape);
        if (shapeIndex >= 0 && shapeIndex < this.existingShapes.length) {
          this.existingShapes[shapeIndex] = parsedShape;
          this.clearCanvas();
        }
      } else if (receivedMsg.type === "state_sync") {
        // Handle full state sync (from undo/redo of other users)
        const shapes = JSON.parse(receivedMsg.payload.shapes);
        this.existingShapes = shapes;
        this.clearCanvas();
      }

      // Reset remote update flag
      this.isRemoteUpdate = false;
    };
  }

  clearCanvas() {
    // Save the current state
    this.ctx.save();

    // Clear the entire canvas
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply zoom and pan transformations
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // Draw grid for infinite canvas feel
    this.drawGrid();

    // Reset drawing state
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2 / this.scale; // Adjust line width for zoom
    
    // Draw all non-eraser shapes
    this.existingShapes.forEach((s, index) => {
      if (s.type === ShapeType.Eraser) return;

      // Highlight selected shape
      if (index === this.selectedShapeIndex) {
        this.ctx.strokeStyle = "#3b82f6"; // Blue for selection
        this.ctx.lineWidth = 3 / this.scale;
      } else {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2 / this.scale;
      }

      // Apply rotation if exists
      const rotation = s.rotation || 0;
      
      if (s.type === ShapeType.RECT || s.type === ShapeType.CIRCLE) {
        const centerX = s.x + s.width / 2;
        const centerY = s.y + s.height / 2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        this.ctx.translate(-centerX, -centerY);
        
        if (s.type === ShapeType.RECT) {
          this.ctx.strokeRect(s.x, s.y, s.width, s.height);
        } else {
          this.drawCircle(s.x, s.y, s.width, s.height);
        }
        
        this.ctx.restore();
        
        // Draw selection box
        if (index === this.selectedShapeIndex) {
          this.drawSelectionBox(s.x, s.y, s.width, s.height, rotation);
        }
      } else if (s.type === ShapeType.PENCIL && s.path) {
        // Calculate center if not set
        if (s.centerX === undefined || s.centerY === undefined) {
          const bounds = this.getPathBounds(s.path);
          if (bounds) {
            s.centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
            s.centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;
          }
        }

        if (rotation !== 0 && s.centerX !== undefined && s.centerY !== undefined) {
          this.ctx.save();
          this.ctx.translate(s.centerX, s.centerY);
          this.ctx.rotate(rotation);
          this.ctx.translate(-s.centerX, -s.centerY);
          this.drawPath(s.path);
          this.ctx.restore();
        } else {
          this.drawPath(s.path);
        }
        
        // Draw selection highlight for pencil
        if (index === this.selectedShapeIndex) {
          const bounds = this.getPathBounds(s.path);
          if (bounds) {
            const width = bounds.maxX - bounds.minX;
            const height = bounds.maxY - bounds.minY;
            this.drawSelectionBox(bounds.minX, bounds.minY, width, height, rotation);
          }
        }
      }
    });

    // Apply erasers
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

    // Restore the state
    this.ctx.restore();
  }

  private drawSelectionBox(x: number, y: number, width: number, height: number, rotation: number = 0) {
    this.ctx.save();
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Apply rotation to selection box
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation);
    this.ctx.translate(-centerX, -centerY);
    
    this.ctx.strokeStyle = "#3b82f6";
    this.ctx.lineWidth = 1 / this.scale;
    this.ctx.setLineDash([5 / this.scale, 5 / this.scale]);
    
    const padding = 5 / this.scale;
    const left = Math.min(x, x + width) - padding;
    const top = Math.min(y, y + height) - padding;
    const w = Math.abs(width) + padding * 2;
    const h = Math.abs(height) + padding * 2;
    
    this.ctx.strokeRect(left, top, w, h);
    
    // Draw handles
    this.ctx.setLineDash([]);
    this.ctx.fillStyle = "#3b82f6";
    const handleSize = 8 / this.scale;
    
    // Corner handles
    const corners = [
      [left, top],           // nw
      [left + w, top],       // ne
      [left, top + h],       // sw
      [left + w, top + h]    // se
    ];
    
    corners.forEach(([cx, cy]) => {
      this.ctx.fillRect(cx - handleSize/2, cy - handleSize/2, handleSize, handleSize);
    });
    
    // Edge handles
    const edges = [
      [left + w/2, top],     // n
      [left + w/2, top + h], // s
      [left, top + h/2],     // w
      [left + w, top + h/2]  // e
    ];
    
    edges.forEach(([cx, cy]) => {
      this.ctx.fillRect(cx - handleSize/2, cy - handleSize/2, handleSize, handleSize);
    });
    
    // Rotation handle (above top center)
    const rotateDistance = 30 / this.scale;
    const rotateX = left + w/2;
    const rotateY = top - rotateDistance;
    
    // Draw line to rotation handle
    this.ctx.beginPath();
    this.ctx.moveTo(left + w/2, top);
    this.ctx.lineTo(rotateX, rotateY);
    this.ctx.strokeStyle = "#3b82f6";
    this.ctx.lineWidth = 1 / this.scale;
    this.ctx.stroke();
    
    // Draw rotation handle as circle
    this.ctx.beginPath();
    this.ctx.arc(rotateX, rotateY, handleSize/2, 0, Math.PI * 2);
    this.ctx.fillStyle = "#10b981"; // Green for rotation
    this.ctx.fill();
    this.ctx.strokeStyle = "#3b82f6";
    this.ctx.lineWidth = 2 / this.scale;
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private getPathBounds(path: {x: number, y: number}[]): {minX: number, minY: number, maxX: number, maxY: number} | null {
    if (path.length === 0) return null;
    
    let minX = path[0].x;
    let minY = path[0].y;
    let maxX = path[0].x;
    let maxY = path[0].y;
    
    path.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    return { minX, minY, maxX, maxY };
  }

  private getShapeBounds(shape: Shape): {x: number, y: number, width: number, height: number} | null {
    if (shape.type === ShapeType.RECT || shape.type === ShapeType.CIRCLE) {
      return {
        x: Math.min(shape.x, shape.x + shape.width),
        y: Math.min(shape.y, shape.y + shape.height),
        width: Math.abs(shape.width),
        height: Math.abs(shape.height)
      };
    } else if (shape.type === ShapeType.PENCIL && shape.path) {
      const bounds = this.getPathBounds(shape.path);
      if (!bounds) return null;
      return {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY
      };
    }
    return null;
  }

  private getHandleAtPoint(x: number, y: number, bounds: {x: number, y: number, width: number, height: number}): string | null {
    const handleSize = 8 / this.scale;
    const rotateHandleDistance = 30 / this.scale;
    
    const left = bounds.x;
    const right = bounds.x + bounds.width;
    const top = bounds.y;
    const bottom = bounds.y + bounds.height;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    // Check rotation handle (above top-center)
    const rotateX = centerX;
    const rotateY = top - rotateHandleDistance;
    if (Math.abs(x - rotateX) < handleSize && Math.abs(y - rotateY) < handleSize) {
      return 'rotate';
    }

    // Check corner handles
    const corners = [
      { x: left, y: top, handle: 'nw' },
      { x: right, y: top, handle: 'ne' },
      { x: left, y: bottom, handle: 'sw' },
      { x: right, y: bottom, handle: 'se' }
    ];

    for (const corner of corners) {
      if (Math.abs(x - corner.x) < handleSize && Math.abs(y - corner.y) < handleSize) {
        return corner.handle;
      }
    }

    // Check edge handles
    const edges = [
      { x: centerX, y: top, handle: 'n' },
      { x: centerX, y: bottom, handle: 's' },
      { x: left, y: centerY, handle: 'w' },
      { x: right, y: centerY, handle: 'e' }
    ];

    for (const edge of edges) {
      if (Math.abs(x - edge.x) < handleSize && Math.abs(y - edge.y) < handleSize) {
        return edge.handle;
      }
    }

    return null;
  }

  private getCursorForHandle(handle: string): string {
    const cursors: {[key: string]: string} = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      's': 's-resize',
      'e': 'e-resize',
      'w': 'w-resize',
      'rotate': 'grab'
    };
    return cursors[handle] || 'default';
  }

  private calculateAngle(centerX: number, centerY: number, pointX: number, pointY: number): number {
    return Math.atan2(pointY - centerY, pointX - centerX);
  }

  private resizeShape(shapeIndex: number, handle: string, newX: number, newY: number, startX: number, startY: number) {
    const shape = this.existingShapes[shapeIndex];
    if (shape.type !== ShapeType.RECT && shape.type !== ShapeType.CIRCLE) return;

    const deltaX = newX - startX;
    const deltaY = newY - startY;

    const originalX = shape.x;
    const originalY = shape.y;
    const originalWidth = shape.width;
    const originalHeight = shape.height;

    switch (handle) {
      case 'nw':
        shape.x = originalX + deltaX;
        shape.y = originalY + deltaY;
        shape.width = originalWidth - deltaX;
        shape.height = originalHeight - deltaY;
        break;
      case 'ne':
        shape.y = originalY + deltaY;
        shape.width = originalWidth + deltaX;
        shape.height = originalHeight - deltaY;
        break;
      case 'sw':
        shape.x = originalX + deltaX;
        shape.width = originalWidth - deltaX;
        shape.height = originalHeight + deltaY;
        break;
      case 'se':
        shape.width = originalWidth + deltaX;
        shape.height = originalHeight + deltaY;
        break;
      case 'n':
        shape.y = originalY + deltaY;
        shape.height = originalHeight - deltaY;
        break;
      case 's':
        shape.height = originalHeight + deltaY;
        break;
      case 'w':
        shape.x = originalX + deltaX;
        shape.width = originalWidth - deltaX;
        break;
      case 'e':
        shape.width = originalWidth + deltaX;
        break;
    }
  }

  private rotateShape(shapeIndex: number, centerX: number, centerY: number, currentX: number, currentY: number) {
    const shape = this.existingShapes[shapeIndex];
    const currentAngle = this.calculateAngle(centerX, centerY, currentX, currentY);
    const newRotation = currentAngle - this.initialRotation;
    
    // Set rotation for all shape types
    shape.rotation = newRotation;
    
    // For pencil shapes, ensure center is set
    if (shape.type === ShapeType.PENCIL) {
      shape.centerX = centerX;
      shape.centerY = centerY;
    }
  }

  private drawGrid() {
    const gridSize = 50;
    const startX = Math.floor(-this.offsetX / this.scale / gridSize) * gridSize;
    const startY = Math.floor(-this.offsetY / this.scale / gridSize) * gridSize;
    const endX = startX + (this.canvas.width / this.scale) + gridSize;
    const endY = startY + (this.canvas.height / this.scale) + gridSize;

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1 / this.scale;

    // Vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    // Horizontal lines
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
    // Middle mouse button or Shift+Click for panning
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isPanning = true;
      this.panStartX = e.clientX - this.offsetX;
      this.panStartY = e.clientY - this.offsetY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    const coords = this.screenToCanvas(e.clientX, e.clientY);

    // Selection mode
    if (this.selectedTool === ShapeType.SELECT) {
      // Check if clicking on a handle of selected shape
      if (this.selectedShapeIndex !== null) {
        const shape = this.existingShapes[this.selectedShapeIndex];
        const bounds = this.getShapeBounds(shape);
        
        if (bounds) {
          const handle = this.getHandleAtPoint(coords.x, coords.y, bounds);
          
          if (handle === 'rotate') {
            this.isRotating = true;
            const centerX = shape.type === ShapeType.PENCIL && shape.centerX !== undefined 
              ? shape.centerX 
              : bounds.x + bounds.width / 2;
            const centerY = shape.type === ShapeType.PENCIL && shape.centerY !== undefined 
              ? shape.centerY 
              : bounds.y + bounds.height / 2;
            this.initialRotation = this.calculateAngle(centerX, centerY, coords.x, coords.y) - (shape.rotation || 0);
            this.canvas.style.cursor = "grabbing";
            return;
          } else if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            this.dragOffsetX = coords.x;
            this.dragOffsetY = coords.y;
            this.canvas.style.cursor = this.getCursorForHandle(handle);
            return;
          }
        }
      }
      
      // Not clicking a handle, try to select a shape
      const shapeIndex = this.findShapeAtPoint(coords.x, coords.y);
      
      if (shapeIndex !== null) {
        this.selectedShapeIndex = shapeIndex;
        this.isDragging = true;
        this.dragOffsetX = coords.x;
        this.dragOffsetY = coords.y;
        this.canvas.style.cursor = "move";
      } else {
        this.selectedShapeIndex = null;
      }
      this.clearCanvas();
      return;
    }

    // Normal drawing mode
    this.clicked = true;
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

    // Handle end of resizing
    if (this.isResizing && this.selectedShapeIndex !== null) {
      this.isResizing = false;
      this.resizeHandle = null;
      this.canvas.style.cursor = "default";
      
      // Save to history after resizing
      this.saveToHistory();
      
      // Broadcast the updated shape
      const resizedShape = this.existingShapes[this.selectedShapeIndex];
      this.socket.send(
        JSON.stringify({
          type: "update",
          payload: {
            shapeIndex: this.selectedShapeIndex,
            shape: JSON.stringify(resizedShape),
            roomId: this.roomId,
          },
        }),
      );
      return;
    }

    // Handle end of rotation
    if (this.isRotating && this.selectedShapeIndex !== null) {
      this.isRotating = false;
      this.canvas.style.cursor = "default";
      
      // Save to history after rotating
      this.saveToHistory();
      
      // Broadcast the updated shape
      const rotatedShape = this.existingShapes[this.selectedShapeIndex];
      this.socket.send(
        JSON.stringify({
          type: "update",
          payload: {
            shapeIndex: this.selectedShapeIndex,
            shape: JSON.stringify(rotatedShape),
            roomId: this.roomId,
          },
        }),
      );
      return;
    }

    // Handle end of dragging
    if (this.isDragging && this.selectedShapeIndex !== null) {
      this.isDragging = false;
      this.canvas.style.cursor = "default";
      
      // Save to history after moving
      this.saveToHistory();
      
      // Broadcast the updated shape to other users
      const movedShape = this.existingShapes[this.selectedShapeIndex];
      this.socket.send(
        JSON.stringify({
          type: "update",
          payload: {
            shapeIndex: this.selectedShapeIndex,
            shape: JSON.stringify(movedShape),
            roomId: this.roomId,
          },
        }),
      );
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
        rotation: 0,
      };
    } else if (this.selectedTool === ShapeType.CIRCLE) {
      shape = {
        type: ShapeType.CIRCLE,
        x: this.startX,
        y: this.startY,
        height: height,
        width: width,
        rotation: 0,
      };
    } else if (this.selectedTool === ShapeType.PENCIL) {
      // Calculate center for pencil shape
      const bounds = this.getPathBounds(this.currentPath);
      const centerX = bounds ? bounds.minX + (bounds.maxX - bounds.minX) / 2 : this.startX;
      const centerY = bounds ? bounds.minY + (bounds.maxY - bounds.minY) / 2 : this.startY;
      
      shape = {
        type: ShapeType.PENCIL,
        path: this.currentPath,
        rotation: 0,
        centerX: centerX,
        centerY: centerY,
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
    this.saveToHistory(); // Save state after adding shape

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

    const coords = this.screenToCanvas(e.clientX, e.clientY);

    // Handle rotating
    if (this.isRotating && this.selectedShapeIndex !== null) {
      const shape = this.existingShapes[this.selectedShapeIndex];
      const bounds = this.getShapeBounds(shape);
      
      if (bounds) {
        const centerX = shape.type === ShapeType.PENCIL && shape.centerX !== undefined 
          ? shape.centerX 
          : bounds.x + bounds.width / 2;
        const centerY = shape.type === ShapeType.PENCIL && shape.centerY !== undefined 
          ? shape.centerY 
          : bounds.y + bounds.height / 2;
        this.rotateShape(this.selectedShapeIndex, centerX, centerY, coords.x, coords.y);
        this.clearCanvas();
      }
      return;
    }

    // Handle resizing
    if (this.isResizing && this.selectedShapeIndex !== null && this.resizeHandle) {
      this.resizeShape(this.selectedShapeIndex, this.resizeHandle, coords.x, coords.y, this.dragOffsetX, this.dragOffsetY);
      this.dragOffsetX = coords.x;
      this.dragOffsetY = coords.y;
      this.clearCanvas();
      return;
    }

    // Handle dragging selected shape
    if (this.isDragging && this.selectedShapeIndex !== null) {
      const deltaX = coords.x - this.dragOffsetX;
      const deltaY = coords.y - this.dragOffsetY;
      
      this.moveShape(this.selectedShapeIndex, deltaX, deltaY);
      
      this.dragOffsetX = coords.x;
      this.dragOffsetY = coords.y;
      
      this.clearCanvas();
      return;
    }

    // Update cursor in selection mode
    if (this.selectedTool === ShapeType.SELECT && !this.clicked) {
      if (this.selectedShapeIndex !== null) {
        const shape = this.existingShapes[this.selectedShapeIndex];
        const bounds = this.getShapeBounds(shape);
        
        if (bounds) {
          const handle = this.getHandleAtPoint(coords.x, coords.y, bounds);
          if (handle) {
            this.canvas.style.cursor = this.getCursorForHandle(handle);
            return;
          }
        }
      }
      
      const shapeIndex = this.findShapeAtPoint(coords.x, coords.y);
      this.canvas.style.cursor = shapeIndex !== null ? "pointer" : "default";
      return;
    }

    if (!this.clicked) return;

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
    
    // Ctrl + Wheel = Zoom
    if (e.ctrlKey || e.metaKey) {
      const zoomIntensity = 0.1;
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      const newScale = this.scale * (1 + delta);
      this.zoomAtPoint(newScale, e.clientX, e.clientY);
    }
    // Shift + Wheel = Horizontal scroll
    else if (e.shiftKey) {
      const scrollSpeed = 1;
      this.offsetX -= e.deltaY * scrollSpeed;
      this.clearCanvas();
    }
    // Normal Wheel = Vertical scroll
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