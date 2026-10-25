"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
  useState,
} from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalysisPoint } from "@/lib/types";

const megawatts = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const deliveryDate = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Europe/London",
});
const deliveryTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
  timeZoneName: "short",
});
const publishedTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});
const axisTime = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

function xPosition(index: number, count: number) {
  return (index / Math.max(count - 1, 1)) * 100;
}
function yPosition(value: number, min: number, range: number) {
  return 100 - ((value - min) / range) * 100;
}
function line(
  points: AnalysisPoint[],
  key: "actual_mw" | "forecast_mw",
  min: number,
  range: number,
) {
  return points
    .map(
      (point, index) =>
        `${xPosition(index, points.length)},${yPosition(point[key], min, range)}`,
    )
    .join(" ");
}

export function GenerationChart({ points }: { points: AnalysisPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [centreIndex, setCentreIndex] = useState(() =>
    Math.floor(points.length / 2),
  );
  const visibleCount = Math.max(Math.ceil(points.length / zoom), 2);
  const maxStart = Math.max(points.length - visibleCount, 0);
  const startIndex = Math.min(
    Math.max(Math.round(centreIndex - visibleCount / 2), 0),
    maxStart,
  );
  const visiblePoints = points.slice(startIndex, startIndex + visibleCount);
  const values = visiblePoints.flatMap((point) => [
    point.actual_mw,
    point.forecast_mw,
  ]);
  const min = visiblePoints.length ? Math.min(...values) : 0;
  const range = visiblePoints.length
    ? Math.max(Math.max(...values) - min, 1)
    : 1;
  const active = activeIndex === null ? null : visiblePoints[activeIndex];
  const activeX =
    activeIndex === null ? 0 : xPosition(activeIndex, visiblePoints.length);
  const middlePoint = visiblePoints[Math.floor(visiblePoints.length / 2)];

  function inspect(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1,
    );
    setActiveIndex(Math.round(ratio * (visiblePoints.length - 1)));
  }

  function navigate(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    setActiveIndex((current) =>
      Math.min(
        Math.max((current ?? 0) + direction, 0),
        visiblePoints.length - 1,
      ),
    );
  }

  function changeZoom(nextZoom: number) {
    const boundedZoom = Math.min(Math.max(nextZoom, 1), 8);
    setCentreIndex(
      startIndex + (activeIndex ?? Math.floor(visiblePoints.length / 2)),
    );
    setZoom(boundedZoom);
    setActiveIndex(null);
  }

  function zoomWithWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? zoom * 2 : zoom / 2);
  }

  return (
    <Card className="min-h-0 flex-1 border-violet-100 shadow-none ring-violet-100">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Generation profile</CardTitle>
          <CardDescription>
            Hover to inspect · Scroll or use controls to zoom
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <i className="size-2 rounded-full bg-violet-700" />
              Actual
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-2 rounded-full bg-fuchsia-400" />
              Forecast
            </span>
          </div>
          <div className="flex items-center rounded-lg border border-violet-100 bg-white p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom out"
              title="Zoom out"
              disabled={zoom === 1}
              onClick={() => changeZoom(zoom / 2)}
            >
              <ZoomOut />
            </Button>
            <span className="w-10 text-center text-[11px] font-medium text-violet-700">
              {zoom}×
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom in"
              title="Zoom in"
              disabled={zoom === 8}
              onClick={() => changeZoom(zoom * 2)}
            >
              <ZoomIn />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset zoom"
              title="Reset zoom"
              disabled={zoom === 1}
              onClick={() => {
                setZoom(1);
                setActiveIndex(null);
              }}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        {points.length ? (
          <div
            className="relative grid h-full min-h-64 w-full grid-cols-[5.5rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_2.75rem] rounded-lg bg-violet-50/60 pt-4 pr-4"
            onWheel={zoomWithWheel}
          >
            <div className="relative col-start-1 row-start-1">
              <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-medium tracking-wide whitespace-nowrap text-violet-700 [writing-mode:vertical-rl] rotate-180">
                Generation (MW)
              </span>
              <span className="absolute top-0 right-2 text-[10px] tabular-nums text-muted-foreground">
                {megawatts.format(min + range)}
              </span>
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground">
                {megawatts.format(min + range / 2)}
              </span>
              <span className="absolute right-2 bottom-0 text-[10px] tabular-nums text-muted-foreground">
                {megawatts.format(min)}
              </span>
            </div>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="col-start-2 row-start-1 h-full w-full cursor-crosshair overflow-visible border-b border-l border-violet-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              role="img"
              tabIndex={0}
              aria-label={
                active
                  ? `Settlement period ${active.settlement_period}, actual ${active.actual_mw} megawatts, forecast ${active.forecast_mw} megawatts`
                  : "Actual and forecast wind generation. Hover or use arrow keys to inspect delivery slots."
              }
              onPointerMove={inspect}
              onPointerLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex((current) => current ?? 0)}
              onBlur={() => setActiveIndex(null)}
              onKeyDown={navigate}
            >
              <line
                x1="0"
                x2="100"
                y1="0"
                y2="0"
                vectorEffect="non-scaling-stroke"
                className="stroke-violet-200"
                strokeDasharray="3 3"
              />
              <line
                x1="0"
                x2="100"
                y1="50"
                y2="50"
                vectorEffect="non-scaling-stroke"
                className="stroke-violet-200"
                strokeDasharray="3 3"
              />
              <polyline
                points={line(visiblePoints, "forecast_mw", min, range)}
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="stroke-fuchsia-400"
                strokeWidth="2"
                opacity=".9"
              />
              <polyline
                points={line(visiblePoints, "actual_mw", min, range)}
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="stroke-violet-700"
                strokeWidth="2"
              />
              {active && (
                <>
                  <line
                    x1={activeX}
                    x2={activeX}
                    y1="0"
                    y2="100"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-violet-300"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={activeX}
                    cy={yPosition(active.forecast_mw, min, range)}
                    r="1.6"
                    vectorEffect="non-scaling-stroke"
                    className="fill-white stroke-fuchsia-500"
                    strokeWidth="2"
                  />
                  <circle
                    cx={activeX}
                    cy={yPosition(active.actual_mw, min, range)}
                    r="1.6"
                    vectorEffect="non-scaling-stroke"
                    className="fill-white stroke-violet-700"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
            <div className="col-start-2 row-start-2 pt-1">
              <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground">
                <span>
                  {axisTime.format(new Date(visiblePoints[0].start_time))}
                </span>
                <span>{axisTime.format(new Date(middlePoint.start_time))}</span>
                <span>
                  {axisTime.format(
                    new Date(
                      visiblePoints[visiblePoints.length - 1].start_time,
                    ),
                  )}
                </span>
              </div>
              <p className="mt-1 text-center text-[10px] font-medium tracking-wide text-violet-700">
                Delivery time (UK)
              </p>
            </div>
            {active && (
              <div
                className="pointer-events-none absolute top-5 z-10 w-64 rounded-xl border border-violet-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur"
                style={{
                  left: `${activeX}%`,
                  transform:
                    activeX < 18
                      ? "none"
                      : activeX > 82
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                <div className="flex items-center justify-between border-b border-violet-100 pb-2">
                  <strong className="text-sm text-violet-950">
                    {deliveryDate.format(new Date(active.start_time))}
                  </strong>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-700">
                    SP {active.settlement_period}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="text-right font-medium">
                    {deliveryTime.format(new Date(active.start_time))}
                  </dd>
                  <dt className="text-muted-foreground">Actual</dt>
                  <dd className="text-right font-medium text-violet-700">
                    {megawatts.format(active.actual_mw)} MW
                  </dd>
                  <dt className="text-muted-foreground">Forecast</dt>
                  <dd className="text-right font-medium text-fuchsia-600">
                    {megawatts.format(active.forecast_mw)} MW
                  </dd>
                  <dt className="text-muted-foreground">Error</dt>
                  <dd className="text-right font-medium">
                    {active.error_mw > 0 ? "+" : ""}
                    {megawatts.format(active.error_mw)} MW
                  </dd>
                </dl>
                <p className="mt-2 border-t border-violet-100 pt-2 text-[11px] text-muted-foreground">
                  Forecast published{" "}
                  {publishedTime.format(new Date(active.forecast_publish_time))}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid h-full min-h-64 place-items-center rounded-lg bg-violet-50/60 text-sm text-muted-foreground">
            No matched observations
          </div>
        )}
      </CardContent>
    </Card>
  );
}
