import type { AnalysisResponse, Filters, ResourceOption } from "@/lib/types";

function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return apiUrl.replace(/\/$/, "");
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(body?.detail ?? "Unable to load generation data");
  }
  return response.json() as Promise<T>;
}

export async function getResources(): Promise<ResourceOption[]> {
  return (
    await getJson<{ resources: ResourceOption[] }>("/generation/metadata")
  ).resources;
}

export async function getAnalysis(filters: Filters): Promise<AnalysisResponse> {
  let deliveryFrom = "2026-01-01";
  let deliveryTo = "2026-01-31";
  let publishFrom = "2025-12-01T00:00:00Z";
  let publishTo = "2026-01-31T23:59:00Z";

  if (filters.viewMode === "range") {
    deliveryFrom = filters.deliveryDateFrom;
    deliveryTo = filters.deliveryDateTo;
  }

  if (filters.viewMode === "next-day") {
    const decisionDate = new Date(`${filters.decisionDate}T00:00:00Z`);
    const deliveryDate = new Date(decisionDate);
    deliveryDate.setUTCDate(deliveryDate.getUTCDate() + 1);
    deliveryFrom = deliveryDate.toISOString().slice(0, 10);
    deliveryTo = deliveryFrom;
    const priorDate = new Date(decisionDate);
    priorDate.setUTCDate(priorDate.getUTCDate() - 1);
    publishFrom = `${priorDate.toISOString().slice(0, 10)}T00:00:00Z`;
    publishTo = `${filters.decisionDate}T23:59:00Z`;
  }

  const params = new URLSearchParams({
    delivery_date_from: deliveryFrom,
    delivery_date_to: deliveryTo,
    forecast_publish_from: publishFrom,
    forecast_publish_to: publishTo,
    fuel_type: filters.fuelType,
    decision_cutoff: filters.decisionCutoff,
    timezone: "Europe/London",
  });
  return getJson<AnalysisResponse>(`/generation/analysis?${params}`);
}
