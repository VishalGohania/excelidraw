export type Shape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
} | {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
} | {
  type: "pencil"; 
  points: {x: number; y: number}[];
}

export type Tool = "circle" | "pencil" | "rect";