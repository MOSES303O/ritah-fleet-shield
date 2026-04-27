import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, AlertTriangle, Wallet, FileText } from "lucide-react";
import Nav from "@/components/Nav";
import AuthGate from "@/components/AuthGate";
import { formatKes, mockFineLedger, mockHireContracts, rentalFleet } from "@/lib/rentalFlow";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Ritah" },
      { name: "description", content: "Fleet status, fines, and revenue at a glance." },
      { property: "og:title", content: "Owner Dashboard — Ritah" },
      { property: "og:description", content: "Owner home for the Ritah Shield fleet." },
    ],
  }),
  component: () => (
    <AuthGate roles={["owner", "admin"]}>
      <DashboardPage />
    </AuthGate>
  ),
});

function DashboardPage() {
  const active = mockHireContracts.filter((c) => c.status === "ACTIVE").length;
  const fineTotal = mockFineLedger.reduce((s, f) => s + f.amount, 0);
  const revenue = mockHireContracts.reduce((s, c) => s + c.ratePerDay * 3, 0);

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
          Owner home
        </div>
        <h1 className="text-4xl font-bold">Fleet overview</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Snapshot of your shielded fleet, NTSA fines, active contracts and revenue.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<Car />} label="Vehicles" value={String(rentalFleet.length)} />
          <Stat icon={<FileText />} label="Active contracts" value={String(active)} />
          <Stat icon={<AlertTriangle />} label="Fines settled" value={formatKes(fineTotal)} />
          <Stat icon={<Wallet />} label="Est. revenue" value={formatKes(revenue)} />
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Link to="/fleet" className="glass rounded-2xl p-5 hover:border-[var(--neon)]/40">
            <div className="text-sm font-semibold">Manage fleet →</div>
            <p className="mt-1 text-xs text-muted-foreground">Add, edit, retire vehicles.</p>
          </Link>
          <Link to="/contracts" className="glass rounded-2xl p-5 hover:border-[var(--neon)]/40">
            <div className="text-sm font-semibold">Contracts →</div>
            <p className="mt-1 text-xs text-muted-foreground">Approve hires & bundles.</p>
          </Link>
          <Link to="/tracker" className="glass rounded-2xl p-5 hover:border-[var(--neon)]/40">
            <div className="text-sm font-semibold">Live tracker →</div>
            <p className="mt-1 text-xs text-muted-foreground">Real-time GPS feed.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--lime)]">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
