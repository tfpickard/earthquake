export type QuakeWindow = "hour" | "day" | "week";

export interface QuakeItem {
  id: string;
  time: number;
  mag: number | null;
  depthKm: number | null;
  lon: number;
  lat: number;
  place: string;
  url: string;
}

export interface QuakeResponse {
  generated: number;
  window: QuakeWindow;
  count: number;
  bbox: [number, number, number, number];
  items: QuakeItem[];
}
