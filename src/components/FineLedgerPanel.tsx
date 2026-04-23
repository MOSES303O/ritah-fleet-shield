import { useMemo, useState } from "react";
import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { formatKes, type NtsaFine } from "@/lib/rentalFlow";

type FineFilter = "ALL" | NtsaFine["status"];

export default function FineLedgerPanel({ title, fines }: { title: string; fines: NtsaFine[] }) {
  const [filter, setFilter] = useState<FineFilter>("ALL");
  const [selectedFine, setSelectedFine] = useState<NtsaFine | null>(null);
  const filteredFines = useMemo(
    () => (filter === "ALL" ? fines : fines.filter((fine) => fine.status === filter)),
    [filter, fines],
  );
  const total = filteredFines.reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-bold">
          <AlertTriangle className="mr-2 inline h-5 w-5 text-[var(--danger)]" />
          {title}
        </h2>
        <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {(["ALL", "AUTO-DEDUCTED", "INSUFFICIENT WALLET"] as FineFilter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1 transition ${
                filter === item
                  ? "border-[var(--lime)]/50 bg-[var(--lime)]/10 text-[var(--lime)]"
                  : "border-border bg-background/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-border bg-background/30 p-3 text-xs text-muted-foreground">
        Filtered total: <span className="text-foreground">{formatKes(total)}</span>
      </div>

      <div className="space-y-2">
        {filteredFines.map((fine) => (
          <button
            key={fine.id}
            onClick={() => setSelectedFine(fine)}
            className="w-full rounded-lg border border-border bg-background/30 p-3 text-left text-xs transition hover:border-[var(--danger)]/45"
          >
            <div className="flex justify-between gap-3">
              <span className="font-mono text-[var(--danger)]">{fine.reason}</span>
              <span>{formatKes(fine.amount)}</span>
            </div>
            <div className="mt-1 text-muted-foreground">
              {fine.reg} · {fine.speed}/{fine.limit} km/h · {fine.status} · {fine.createdAt}
            </div>
          </button>
        ))}
      </div>

      <Drawer open={!!selectedFine} onOpenChange={(open) => !open && setSelectedFine(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Fine ledger detail</DrawerTitle>
            <DrawerDescription>NTSA simulation record attached to the hire contract.</DrawerDescription>
          </DrawerHeader>
          {selectedFine && (
            <div className="grid gap-3 p-4 pt-0 text-sm">
              {[
                ["Fine ID", selectedFine.id],
                ["Contract", selectedFine.contractId],
                ["Vehicle", selectedFine.reg],
                ["Reason", selectedFine.reason],
                ["Speed", `${selectedFine.speed}/${selectedFine.limit} km/h`],
                ["Amount", formatKes(selectedFine.amount)],
                ["Status", selectedFine.status],
                ["Created", selectedFine.createdAt],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 rounded-lg border border-border bg-background/30 px-3 py-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-mono">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}