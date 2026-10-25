import type { Dispatch, SetStateAction } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterField } from "@/components/molecules/filter-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Filters, ResourceOption } from "@/lib/types";

type Props = {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  resources: ResourceOption[];
  loading: boolean;
};

export function FilterPanel({
  filters,
  setFilters,
  resources,
  loading,
}: Props) {
  const update = (key: keyof Filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  return (
    <Card className="h-full border-violet-100 shadow-none ring-violet-100">
      <CardHeader>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-violet-600" />
          <CardTitle>Analysis parameters</CardTitle>
          {loading && (
            <span className="ml-auto size-2 animate-pulse rounded-full bg-violet-500" />
          )}
        </div>
        <CardDescription>
          Changes refresh the analysis automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <FilterField label="Resource" htmlFor="fuel-type">
            <Select
              value={filters.fuelType}
              onValueChange={(value) => update("fuelType", value ?? "WIND")}
            >
              <SelectTrigger id="fuel-type" className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.value} value={resource.value}>
                    {resource.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="View" htmlFor="view-mode">
            <Select
              value={filters.viewMode}
              onValueChange={(value) => update("viewMode", value ?? "all")}
            >
              <SelectTrigger id="view-mode" className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All January data</SelectItem>
                <SelectItem value="range">Custom date range</SelectItem>
                <SelectItem value="next-day">Next-day forecast</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          {filters.viewMode === "range" && (
            <>
              <FilterField label="Delivery from" htmlFor="delivery-from">
                <Input
                  id="delivery-from"
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={filters.deliveryDateFrom}
                  onChange={(event) =>
                    update("deliveryDateFrom", event.target.value)
                  }
                  required
                />
              </FilterField>
              <FilterField label="Delivery to" htmlFor="delivery-to">
                <Input
                  id="delivery-to"
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={filters.deliveryDateTo}
                  onChange={(event) =>
                    update("deliveryDateTo", event.target.value)
                  }
                  required
                />
              </FilterField>
            </>
          )}
          {filters.viewMode === "next-day" && (
            <FilterField label="Decision date" htmlFor="decision-date">
              <Input
                id="decision-date"
                type="date"
                min="2025-12-31"
                max="2026-01-30"
                value={filters.decisionDate}
                onChange={(event) => update("decisionDate", event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Displays the forecast for the following delivery day.
              </p>
            </FilterField>
          )}
          <FilterField label="Prior-day cutoff (UK)" htmlFor="cutoff">
            <Input
              id="cutoff"
              type="time"
              value={filters.decisionCutoff}
              onChange={(event) => update("decisionCutoff", event.target.value)}
              required
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
