from __future__ import annotations

import json
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from typing import Any
from urllib.error import URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

BASE_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/"
WINDOWS = {
    "hour": "all_hour",
    "day": "all_day",
    "week": "all_week",
}
CACHE_HEADERS = {
    "hour": "s-maxage=60, stale-while-revalidate=300",
    "day": "s-maxage=180, stale-while-revalidate=600",
    "week": "s-maxage=600, stale-while-revalidate=1800",
}


def _json_response(handler: BaseHTTPRequestHandler, payload: dict[str, Any], status: int) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _parse_min_mag(value: str | None) -> float | None:
    if value is None:
        return None
    try:
        parsed = float(value)
    except ValueError:
        return None
    return parsed


def _fetch_feed(feed: str) -> dict[str, Any]:
    request = Request(f"{BASE_URL}{feed}.geojson", headers={"User-Agent": "EarthquakeConstellations/1.0"})
    with urlopen(request, timeout=10) as response:
        payload = response.read().decode("utf-8")
    return json.loads(payload)


def _normalize(feed: dict[str, Any], window: str, min_mag: float | None) -> dict[str, Any]:
    items = []
    for feature in feed.get("features", []):
        properties = feature.get("properties", {}) or {}
        geometry = feature.get("geometry", {}) or {}
        coords = geometry.get("coordinates", []) or []
        if len(coords) < 2:
            continue

        magnitude = properties.get("mag")
        if min_mag is not None and magnitude is not None and magnitude < min_mag:
            continue

        item = {
            "id": feature.get("id") or "",
            "time": properties.get("time") or 0,
            "mag": magnitude,
            "depthKm": coords[2] if len(coords) > 2 else None,
            "lon": coords[0],
            "lat": coords[1],
            "place": properties.get("place") or "Unknown location",
            "url": properties.get("url") or "",
        }
        items.append(item)

    bbox = feed.get("bbox")
    if not bbox or len(bbox) < 4:
        lons = [item["lon"] for item in items] or [0, 0]
        lats = [item["lat"] for item in items] or [0, 0]
        bbox = [min(lons), min(lats), max(lons), max(lats)]

    return {
        "generated": int(time.time() * 1000),
        "window": window,
        "count": len(items),
        "bbox": [bbox[0], bbox[1], bbox[2], bbox[3]],
        "items": items,
    }


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        window = params.get("window", ["day"])[0]
        min_mag = _parse_min_mag(params.get("minMag", [None])[0])

        if window not in WINDOWS:
            _json_response(
                self,
                {"error": "Invalid window. Use hour, day, or week."},
                HTTPStatus.BAD_REQUEST,
            )
            return

        try:
            feed = _fetch_feed(WINDOWS[window])
        except (URLError, TimeoutError, json.JSONDecodeError):
            _json_response(
                self,
                {
                    "error": "USGS feed is temporarily unavailable. Please try again soon.",
                    "window": window,
                },
                HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return

        payload = _normalize(feed, window, min_mag)
        body = json.dumps(payload).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", CACHE_HEADERS[window])
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
