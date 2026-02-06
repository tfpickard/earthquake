import type { QuakeItem, QuakeResponse, QuakeWindow } from "@/types/quakes";

const WINDOW_SET = new Set<QuakeWindow>(["hour", "day", "week"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isNullableNumber = (value: unknown): value is number | null =>
  value === null || isNumber(value);

export const windowMs: Record<QuakeWindow, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000
};

export const pollIntervalMs: Record<QuakeWindow, number> = {
  hour: 30_000,
  day: 120_000,
  week: 300_000
};

export function parseQuakeResponse(data: unknown): QuakeResponse {
  if (!isRecord(data)) {
    throw new Error("Invalid response payload");
  }

  const { generated, window, count, bbox, items } = data;

  if (!isNumber(generated)) {
    throw new Error("Invalid generated timestamp");
  }

  if (!isString(window) || !WINDOW_SET.has(window as QuakeWindow)) {
    throw new Error("Invalid window");
  }

  if (!isNumber(count)) {
    throw new Error("Invalid count");
  }

  if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(isNumber)) {
    throw new Error("Invalid bounding box");
  }

  if (!Array.isArray(items)) {
    throw new Error("Invalid items list");
  }

  const parsedItems: QuakeItem[] = items.map((item) => {
    if (!isRecord(item)) {
      throw new Error("Invalid item");
    }

    const { id, time, mag, depthKm, lon, lat, place, url } = item;

    if (!isString(id)) {
      throw new Error("Invalid id");
    }
    if (!isNumber(time)) {
      throw new Error("Invalid time");
    }
    if (!isNullableNumber(mag)) {
      throw new Error("Invalid magnitude");
    }
    if (!isNullableNumber(depthKm)) {
      throw new Error("Invalid depth");
    }
    if (!isNumber(lon) || !isNumber(lat)) {
      throw new Error("Invalid coordinates");
    }
    if (!isString(place)) {
      throw new Error("Invalid place");
    }
    if (!isString(url)) {
      throw new Error("Invalid url");
    }

    return { id, time, mag, depthKm, lon, lat, place, url };
  });

  return {
    generated,
    window: window as QuakeWindow,
    count,
    bbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
    items: parsedItems
  };
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
