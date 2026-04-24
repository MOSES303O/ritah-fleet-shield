import { CheckCircle2, Circle, FileText, ShieldCheck, Wallet, AlertTriangle } from "lucide-react";
import type { HireContract } from "@/lib/rentalFlow";

const STATES: Array<{ key: HireContract["status"]; label: string; icon: typeof Circle; detail: string }> = [
  { key: "REQUESTED", label: "Requested", icon: FileText, detail: "Renter submits hire request with delegated contact." },
  { key: "APPROVED", label: "Approved", icon: ShieldCheck, detail: "Owner approves and locks renter to vehicle." },
  { key: "ACTIVE", label: "Active", icon: Wallet, detail: "Stake locked · vehicle in renter possession." },
  { key: "CLOSED", label: "Closed", icon: CheckCircle2, detail: "Stake released · contract auditable." },
];

export default function ContractTimeline({ status }: { status: HireContract["status"] }) {
  const activeIdx = STATES.findIndex((s) => s.key === status);
  return (
    <ol className="relative grid grid-cols-4 gap-2">
      {STATES.map((step, idx) => {
        const reached = idx <= activeIdx;
        const current = idx === activeIdx;
        const Icon = step.icon;
        return (
          <li key={step.key} className="relative flex flex-col items-start gap-2">
            {idx < STATES.length - 1 && (
              <span
                className={`absolute left-4 top-3 -z-10 h-0.5 w-full ${
                  idx < activeIdx ? "bg-[var(--lime)]" : "bg-border"
                }`}
              />
            )}
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                current
                  ? "border-[var(--lime)] bg-[var(--lime)]/15 text-[var(--lime)]"
                  : reached
                    ? "border-[var(--lime)]/40 bg-[var(--lime)]/10 text-[var(--lime)]"
                    : "border-border bg-background/30 text-muted-foreground"
              }`}
            >
              {reached ? <Icon className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            </span>
            <div>
              <div className={`text-[11px] font-mono uppercase tracking-widest ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </div>
              <div className="mt-1 text-[10px] leading-snug text-muted-foreground">{step.detail}</div>
            </div>
          </li>
        );
      })}
      {status === "REQUESTED" && (
        <li className="col-span-4 mt-1 inline-flex items-center gap-2 text-[11px] text-[var(--danger)]">
          <AlertTriangle className="h-3.5 w-3.5" /> Awaiting owner approval before stake can lock.
        </li>
      )}
    </ol>
  );
}
