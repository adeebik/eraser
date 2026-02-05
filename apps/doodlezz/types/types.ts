export enum ShapeType {
  RECT = "rect",
  CIRCLE = "circle",
  PENCIL = "pencil",
  Eraser = "eraser"
}

export type Shape = {
  type: ShapeType.RECT;
  x: number;
  y: number;
  width: number;
  height: number;
} | {
  type: ShapeType.CIRCLE;
  x: number;
  y: number;
  width: number;
  height: number;
} | {
  type: ShapeType.PENCIL;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
} | {
  type: ShapeType.Eraser;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
