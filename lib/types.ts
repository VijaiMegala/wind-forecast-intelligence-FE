export type ResourceOption = {
  value: string;
  label: string;
  actual_dataset: string;
  forecast_dataset: string;
};
export type AnalysisPoint = {
  start_time: string;
  settlement_period: number;
  forecast_publish_time: string;
  forecast_mw: number;
  actual_mw: number;
  error_mw: number;
  absolute_error_mw: number;
  absolute_percentage_error: number | null;
};
export type AnalysisResponse = {
  filters: Record<string, string>;
  metrics: {
    observations: number;
    mae_mw: number;
    rmse_mw: number;
    bias_mw: number;
    mape_percent: number | null;
  };
  points: AnalysisPoint[];
  unmatched_actuals: number;
};
export type Filters = {
  viewMode: "all" | "range" | "next-day";
  decisionDate: string;
  deliveryDateFrom: string;
  deliveryDateTo: string;
  fuelType: string;
  decisionCutoff: string;
};
