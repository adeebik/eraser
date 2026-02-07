export enum ShapeType {
  RECT = "rect",
  CIRCLE = "circle",
  PENCIL = "pencil",
  Eraser = "eraser",
  SELECT = "select"
}

export type Shape = {
  type: ShapeType.RECT;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
} | {
  type: ShapeType.CIRCLE;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
} | {
  type: ShapeType.PENCIL;
  path: Array<{x: number; y: number}>;
  rotation?: number;
  centerX?: number;
  centerY?: number;
} | {
  type: ShapeType.Eraser;
  erasePoints: Array<{x: number; y: number}>;
  rotation?: number;

}