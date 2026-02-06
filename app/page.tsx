"use client";

import { useMemo, useState } from "react";
import ConstellationCanvas, { Star } from "@/components/ConstellationCanvas";
import { useQuakes } from "@/hooks/useQuakes";
import type { QuakeWindow } from "@/types/quakes";
import { windowMs } from "@/lib/quakes";

const WINDOWS: { key: QuakeWindow; label: string }[] = [
  { key: "hour", label: "Past hour" },
  { key: "day", label: "Past day" },
  { key: "week", label: "Past week" }
];

const formatTime = (time: number) =>
  new Date(time).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

const formatMagnitude = (mag: number | null) =>
  mag === null ? "n/a" : mag.toFixed(1);

const formatDepth = (depth: number | null) =>
  depth === null ? "n/a" : `${depth.toFixed(1)} km`;

export default function HomePage() {
  const [timeWindow, setTimeWindow] = useState<QuakeWindow>("day");
  const [minMag, setMinMag] = useState(1.0);
  const [hovered, setHovered] = useState<Star | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const { data, error, isLoading } = useQuakes(timeWindow, minMag);

  const generatedLabel = useMemo(() => {
    if (!data) return "";
    return `Last updated ${formatTime(data.generated)}`;
  }, [data]);

  const ageLabel = useMemo(() => {
    if (!data) return "";
    const oldest = data.items.reduce((min, item) => Math.min(min, item.time), Date.now());
    const minutes = Math.floor((Date.now() - oldest) / 60000);
    return `Oldest in window: ${minutes} min`;
  }, [data]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <ConstellationCanvas
          data={data}
          window={timeWindow}
          onHover={(star, position) => {
            setHovered(star);
            setHoverPos(position);
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />

      <section className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10">
        <header className="pointer-events-auto max-w-xl space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Earthquake Constellations</p>
            <h1 className="text-3xl font-semibold text-slate-100 sm:text-4xl">Living sky of recent seismic activity.</h1>
            <p className="text-sm text-slate-300">
              Each star is an earthquake: magnitude is brightness, depth is blur, age fades into the void.
              Hover or tap to inspect an event.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {WINDOWS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setTimeWindow(option.key)}
                className={`rounded-full border px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 ${
                  timeWindow === option.key
                    ? "border-slate-200 bg-slate-200 text-slate-900"
                    : "border-slate-700/70 bg-slate-900/60 text-slate-200 hover:border-slate-400"
                }`}
                aria-pressed={timeWindow === option.key}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Minimum magnitude</span>
              <span>{minMag.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              step={0.1}
              value={minMag}
              onChange={(event) => setMinMag(Number(event.target.value))}
              className="w-full accent-slate-200"
              aria-label="Minimum magnitude filter"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span>{generatedLabel}</span>
            <span>{ageLabel}</span>
            <span>Window length: {(windowMs[timeWindow] / 3600000).toFixed(0)}h</span>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </header>

        <footer className="pointer-events-auto flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-slate-200">Legend</p>
            <ul className="space-y-1">
              <li>Brightness → magnitude</li>
              <li>Blur → depth</li>
              <li>Fade → age</li>
              <li>Faint lines → regional clusters</li>
            </ul>
          </div>
          <div className="text-right">
            {isLoading ? "Listening to the Earth…" : `${data?.count ?? 0} quakes in view`}
          </div>
        </footer>
      </section>

      {hovered && hoverPos ? (
        <div
          className="pointer-events-none absolute z-20 w-72 rounded-lg border border-slate-500/40 bg-slate-950/80 p-4 text-xs text-slate-100 shadow-xl"
          style={{
            left: Math.min(hoverPos.x + 24, window.innerWidth - 300),
            top: Math.min(hoverPos.y + 24, window.innerHeight - 200)
          }}
          role="dialog"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-slate-100">{hovered.item.place}</p>
          <div className="mt-2 space-y-1 text-slate-300">
            <p>Magnitude: {formatMagnitude(hovered.item.mag)}</p>
            <p>Depth: {formatDepth(hovered.item.depthKm)}</p>
            <p>Time: {formatTime(hovered.item.time)}</p>
          </div>
          <a
            href={hovered.item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-xs text-sky-300 underline"
          >
            View USGS event
          </a>
        </div>
      ) : null}
    </main>
  );
}
