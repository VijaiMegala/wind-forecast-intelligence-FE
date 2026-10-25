import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function MetricValue({ value, label, hint, explanation }: { value: string; label: string; hint: string; explanation: string }) {
  return <div><div className="flex items-center gap-1.5"><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p><Tooltip><TooltipTrigger aria-label={`About ${label}`} className="rounded-full text-violet-500 outline-none hover:text-violet-700 focus-visible:ring-2 focus-visible:ring-violet-400"><Info className="size-3.5" /></TooltipTrigger><TooltipContent className="max-w-64">{explanation}</TooltipContent></Tooltip></div><p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-violet-950">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>
}
