import { createFileRoute } from "@tanstack/react-router";
import { Car, Plus } from "lucide-react";
import Nav from "@/components/Nav";
import AuthGate from "@/components/AuthGate";
import { formatKes, rentalFleet } from "@/lib/rentalFlow";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet Management — Ritah" },
      { name: "description", content: "Add, edit and list shielded vehicles." },
      { property: "og:title", content: "Fleet Management — Ritah" },
      { property: "og:description", content: "Vehicle inventory for fleet owners." },
    ],
  }),
  component: () => (
    <AuthGate roles={["owner", "admin"]}>
      <FleetPage />
    </AuthGate>
  ),
});

function FleetPage() {
  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
              Inventory
            </div>
            <h1 className="text-4xl font-bold">Fleet</h1>
            <p className="mt-2 text-muted-foreground">Vehicle management — add, edit, list.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[var(--neon)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
            <Plus className="h-4 w-4" />
            Add vehicle
          </button>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentalFleet.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-[var(--neon)]">
                <Car className="h-4 w-4" />
                <span className="text-xs font-mono">{c.reg}</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">
                {c.make} {c.model}
              </h3>
              <p className="text-xs text-muted-foreground">{c.location} · {c.seats} seats</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border p-2">
                  <div className="text-muted-foreground">Rate/day</div>
                  <div className="font-semibold">{formatKes(c.ratePerDay)}</div>
                </div>
                <div className="rounded-lg border border-border p-2">
                  <div className="text-muted-foreground">Stake</div>
                  <div className="font-semibold">{formatKes(c.stake)}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span
                  className={
                    c.available
                      ? "rounded-full bg-[var(--lime)]/10 border border-[var(--lime)]/40 px-3 py-1 text-[var(--lime)]"
                      : "rounded-full border border-border px-3 py-1 text-muted-foreground"
                  }
                >
                  {c.available ? "AVAILABLE" : "LOCKED"}
                </span>
                <button className="text-[var(--neon)]">Edit →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
