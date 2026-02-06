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
  path: Array<{x: number; y: number}>;
} | {
  type: ShapeType.Eraser;
  erasePoints: Array<{x: number; y: number}>;
}