import { MetricValue } from "@/components/atoms/metric-value"
import { Card, CardContent } from "@/components/ui/card"

export function MetricCard(props: { value: string; label: string; hint: string; explanation: string }) {
  return <Card className="border-violet-100 shadow-none ring-violet-100"><CardContent><MetricValue {...props} /></CardContent></Card>
}
