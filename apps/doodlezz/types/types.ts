export enum ShapeType {
  RECT = "rect",
  CIRCLE = "circle",
  PENCIL = "pencil",
  Eraser = "eraser",
  SELECT = "select"
}

export type ShapeStyle = {
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  fillStyle: "none" | "solid" | "hatch" | "dots";
}

export type Shape = {
  type: ShapeType.RECT;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style?: ShapeStyle;
} | {
  type: ShapeType.CIRCLE;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style?: ShapeStyle;
} | {
  type: ShapeType.PENCIL;
  path: Array<{x: number; y: number}>;
  rotation?: number;
  centerX?: number;
  centerY?: number;
  style?: ShapeStyle;
} | {
  type: ShapeType.Eraser;
  erasePoints: Array<{x: number; y: number}>;
  rotation?: number;
}

