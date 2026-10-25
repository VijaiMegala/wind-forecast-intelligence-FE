"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Wind } from "lucide-react";
import { MetricCard } from "@/components/molecules/metric-card";
import { FilterPanel } from "@/components/organisms/filter-panel";
import { GenerationChart } from "@/components/organisms/generation-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAnalysis, getResources } from "@/lib/api";
import type { AnalysisResponse, Filters, ResourceOption } from "@/lib/types";

const initialFilters: Filters = {
  viewMode: "all",
  decisionDate: "2025-12-31",
  deliveryDateFrom: "2026-01-01",
  deliveryDateTo: "2026-01-31",
  fuelType: "WIND",
  decisionCutoff: "11:00",
};
const defaultResources: ResourceOption[] = [
  {
    value: "WIND",
    label: "Wind",
    actual_dataset: "FUELHH",
    forecast_dataset: "WINDFOR",
  },
];
const mw = (value: number) =>
  `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value)} MW`;
const day = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeZone: "UTC",
});

export function Dashboard() {
  const [filters, setFilters] = useState(initialFilters);
  const [resources, setResources] = useState(defaultResources);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextDeliveryDate = new Date(`${filters.decisionDate}T00:00:00Z`);
  nextDeliveryDate.setUTCDate(nextDeliveryDate.getUTCDate() + 1);
  const heading =
    filters.viewMode === "all"
      ? "Wind forecast accuracy · January 2026"
      : filters.viewMode === "range"
        ? "Wind forecast accuracy · Custom range"
        : `Wind forecast for ${day.format(nextDeliveryDate)}`;
  useEffect(() => {
    getResources()
      .then(setResources)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAnalysis(filters);
        if (active) setData(response);
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "Unable to load data",
          );
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [filters]);

  return (
    <TooltipProvider>
      <main className="h-screen overflow-hidden bg-white text-slate-950">
        <header className="h-16 border-b border-violet-100 bg-white">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-700">
                <Wind className="size-5" />
              </span>
              <div>
                <p className="font-semibold tracking-tight text-violet-950">
                  GridSight
                </p>
                <p className="text-xs text-violet-500">
                  Renewable intelligence
                </p>
              </div>
            </div>
            {loading && (
              <span className="flex items-center gap-2 text-xs text-violet-600">
                <LoaderCircle className="size-3.5 animate-spin" />
                Updating
              </span>
            )}
          </div>
        </header>
        <div className="mx-auto grid h-[calc(100vh-4rem)] max-w-[1600px] grid-cols-[minmax(0,1fr)_340px] gap-5 p-5">
          <section className="flex min-h-0 flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Day-ahead operations
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-violet-950">
                {heading}
              </h1>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}. Confirm the FastAPI backend is running on port 8000.
                </AlertDescription>
              </Alert>
            )}
            <section className="grid grid-cols-4 gap-3">
              <MetricCard
                label="MAE"
                value={data ? mw(data.metrics.mae_mw) : "—"}
                hint="Typical forecast miss"
                explanation="Mean Absolute Error is the average absolute difference between forecast and actual generation. Lower is better."
              />
              <MetricCard
                label="RMSE"
                value={data ? mw(data.metrics.rmse_mw) : "—"}
                hint="Weights larger misses"
                explanation="Root Mean Square Error gives extra weight to large forecast misses. Lower is better."
              />
              <MetricCard
                label="Bias"
                value={data ? mw(data.metrics.bias_mw) : "—"}
                hint={
                  data
                    ? data.metrics.bias_mw >= 0
                      ? "Forecast overstates"
                      : "Forecast understates"
                    : "Direction of error"
                }
                explanation="Bias is the average signed error. Positive means forecasts were too high; negative means they were too low."
              />
              <MetricCard
                label="MAPE"
                value={
                  data?.metrics.mape_percent == null
                    ? "—"
                    : `${data.metrics.mape_percent}%`
                }
                hint={
                  data
                    ? `${data.metrics.observations} matched hours`
                    : "Percentage error"
                }
                explanation="Mean Absolute Percentage Error expresses the typical absolute forecast miss as a percentage of actual generation. Lower is better."
              />
            </section>
            <GenerationChart points={data?.points ?? []} />
          </section>
          <aside className="min-h-0">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              resources={resources}
              loading={loading}
            />
          </aside>
        </div>
      </main>
    </TooltipProvider>
  );
}
