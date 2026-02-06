"use client";

import { useEffect, useMemo, useRef } from "react";
import type { QuakeItem, QuakeResponse, QuakeWindow } from "@/types/quakes";
import { clamp, windowMs } from "@/lib/quakes";

const MAX_STARS = 2000;

export interface Star {
  id: string;
  item: QuakeItem;
  lon: number;
  lat: number;
  baseSize: number;
  baseAlpha: number;
  blur: number;
  clusterId: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface Cluster {
  id: string;
  stars: Star[];
  label: string;
}

interface ConstellationCanvasProps {
  data: QuakeResponse | null;
  window: QuakeWindow;
  onHover: (star: Star | null, position: { x: number; y: number } | null) => void;
}

const mapPosition = (lon: number, lat: number, width: number, height: number) => {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

const getClusterId = (lon: number, lat: number) => {
  const lonBin = Math.floor((lon + 180) / 30);
  const latBin = Math.floor((lat + 90) / 20);
  return `${lonBin}-${latBin}`;
};

const formatClusterLabel = (place: string) => {
  if (!place) return "";
  const parts = place.split(" of ");
  return parts.length > 1 ? parts[1] : place;
};

export default function ConstellationCanvas({ data, window, onHover }: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const hoveredRef = useRef<Star | null>(null);

  const { stars, clusters } = useMemo(() => {
    if (!data) {
      return { stars: [] as Star[], clusters: [] as Cluster[] };
    }

    const sorted = [...data.items].sort((a, b) => {
      const timeDiff = b.time - a.time;
      if (timeDiff !== 0) return timeDiff;
      return (b.mag ?? 0) - (a.mag ?? 0);
    });

    const now = Date.now();
    const maxWindow = windowMs[window];
    const trimmed = sorted.slice(0, MAX_STARS);

    const computedStars = trimmed.map((item) => {
      const ageRatio = clamp(1 - (now - item.time) / maxWindow, 0, 1);
      const magnitude = item.mag ?? 0.6;
      const baseSize = clamp(1.2 + magnitude * 1.4, 1.2, 7);
      const baseAlpha = clamp(0.15 + ageRatio * 0.85, 0.1, 1);
      const depth = item.depthKm ?? 0;
      const blur = clamp(depth / 20, 0, 12);
      const clusterId = getClusterId(item.lon, item.lat);

      return {
        id: item.id,
        item,
        lon: item.lon,
        lat: item.lat,
        baseSize,
        baseAlpha,
        blur,
        clusterId,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.6 + Math.random() * 1.2
      } satisfies Star;
    });

    const clusterMap = new Map<string, Cluster>();

    computedStars.forEach((star) => {
      const existing = clusterMap.get(star.clusterId);
      if (existing) {
        existing.stars.push(star);
      } else {
        clusterMap.set(star.clusterId, {
          id: star.clusterId,
          stars: [star],
          label: formatClusterLabel(star.item.place)
        });
      }
    });

    clusterMap.forEach((cluster) => {
      if (!cluster.label) {
        const best = cluster.stars.reduce((current, star) =>
          (star.item.mag ?? 0) > (current.item.mag ?? 0) ? star : current
        );
        cluster.label = formatClusterLabel(best.item.place);
      }
    });

    return { stars: computedStars, clusters: [...clusterMap.values()] };
  }, [data, window]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      sizeRef.current = { width: clientWidth, height: clientHeight };
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;

    const render = (time: number) => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        width * 0.1,
        width * 0.5,
        height * 0.4,
        width * 0.9
      );
      gradient.addColorStop(0, "rgba(20, 30, 50, 0.25)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      clusters.forEach((cluster) => {
        if (cluster.stars.length < 2) return;
        const isHoveredCluster =
          hoveredRef.current && cluster.id === hoveredRef.current.clusterId;
        ctx.beginPath();
        cluster.stars.forEach((star, index) => {
          const { x, y } = mapPosition(star.lon, star.lat, width, height);
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.strokeStyle = isHoveredCluster
          ? "rgba(200, 230, 255, 0.35)"
          : "rgba(120, 170, 255, 0.08)";
        ctx.lineWidth = isHoveredCluster ? 1.2 : 0.6;
        ctx.stroke();
      });

      stars.forEach((star) => {
        const { x, y } = mapPosition(star.lon, star.lat, width, height);
        const twinkle = 0.75 + Math.sin(time / 1000 * star.twinkleSpeed + star.twinklePhase) * 0.25;
        const alpha = clamp(star.baseAlpha * twinkle, 0.05, 1);
        const isHovered = hoveredRef.current?.id === star.id;

        ctx.beginPath();
        ctx.fillStyle = isHovered
          ? `rgba(255, 255, 255, ${clamp(alpha + 0.3, 0, 1)})`
          : `rgba(220, 240, 255, ${alpha})`;
        ctx.shadowColor = isHovered
          ? `rgba(255, 255, 255, ${clamp(alpha + 0.2, 0, 1)})`
          : `rgba(150, 210, 255, ${alpha})`;
        ctx.shadowBlur = isHovered ? star.blur + 6 : star.blur;
        ctx.arc(x, y, isHovered ? star.baseSize + 1.6 : star.baseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      clusters.forEach((cluster) => {
        if (cluster.stars.length < 3 || !cluster.label) return;
        const brightest = cluster.stars.reduce((current, star) =>
          star.baseSize > current.baseSize ? star : current
        );
        const { x, y } = mapPosition(brightest.lon, brightest.lat, width, height);
        ctx.fillStyle = "rgba(200, 220, 255, 0.4)";
        ctx.font = "12px 'Inter', system-ui, sans-serif";
        ctx.fillText(cluster.label, x + 8, y - 8);
      });

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrame);
  }, [clusters, stars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { width, height } = sizeRef.current;
      let closest: Star | null = null;
      let closestDistance = 20;

      for (const star of stars) {
        const point = mapPosition(star.lon, star.lat, width, height);
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < closestDistance) {
          closest = star;
          closestDistance = distance;
        }
      }

      if (closest) {
        hoveredRef.current = closest;
        const point = mapPosition(closest.lon, closest.lat, width, height);
        onHover(closest, { x: point.x, y: point.y });
      } else {
        hoveredRef.current = null;
        onHover(null, null);
      }
    };

    const handlePointerLeave = () => {
      hoveredRef.current = null;
      onHover(null, null);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [onHover, stars]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="Earthquake constellation canvas"
    />
  );
}
