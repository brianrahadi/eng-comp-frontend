export type Status = "OK" | "LOWLIGHT" | "WARNING";

export interface Camera {
  Position: [number, number];
  SegmentID: number;
  Water: number;
  Light: number;
  Status: Status;
  ViewDescription?: string;
}

