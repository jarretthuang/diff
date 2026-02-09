export type LineType = "raw" | "common" | "add" | "remove" | "void";

export interface Line {
  content: string;
  type: LineType;
}

export interface DiffLine extends Line {
  originLeft?: number;
  originRight?: number;
}
