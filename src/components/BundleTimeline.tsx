import { CheckCircle2, Circle, FileText, Layers, ShieldCheck, Wallet } from "lucide-react";
import type { FleetHireBundle } from "@/lib/rentalFlow";

const STATES: Array<{ key: FleetHireBundle["status"]; label: string; icon: typeof Circle; detail: string }> = [
  { key: "REQUESTED", label: "Requested", icon: FileText, detail: "Renter posts bundle for owner review." },
  { key: "APPROVED", label: "Approved", icon: ShieldCheck, detail: "Owner approves all cars in the bundle." },
  { key: "ACTIVE", label: "Active", icon: Wallet, detail: "Combined stake locked across all cars." },
  { key: "CLOSED", label: "Closed", icon: CheckCircle2, detail: "Bundle settled · stake released." },
];

export default function BundleTimeline({ status, carCount }: { status: FleetHireBundle["status"]; carCount: number }) {
  const activeIdx = STATES.findIndex((s) => s.key === status);
  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--neon)]">
        <Layers className="h-3 w-3" /> Bundle · {carCount} cars
      </div>
      <ol className="relative grid grid-cols-4 gap-2">
        {STATES.map((step, idx) => {
          const reached = idx <= activeIdx;
          const current = idx === activeIdx;
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative flex flex-col items-start gap-1.5">
              {idx < STATES.length - 1 && (
                <span
                  className={`absolute left-3 top-3 -z-10 h-0.5 w-full ${
                    idx < activeIdx ? "bg-[var(--neon)]" : "bg-border"
                  }`}
                />
              )}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  current
                    ? "border-[var(--neon)] bg-[var(--neon)]/15 text-[var(--neon)]"
                    : reached
                      ? "border-[var(--neon)]/40 bg-[var(--neon)]/10 text-[var(--neon)]"
                      : "border-border bg-background/30 text-muted-foreground"
                }`}
              >
                {reached ? <Icon className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              </span>
              <div className={`text-[10px] font-mono uppercase tracking-widest ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </div>
              <div className="text-[9px] leading-snug text-muted-foreground">{step.detail}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
