import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

export function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div className="grid gap-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>
}
