import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import FineLedgerPanel from "@/components/FineLedgerPanel";
import { getSignups, clearSignups, type Signup } from "@/lib/signups";
import {
  seedFleet,
  tickFleet,
  maybeGenerateViolation,
  type Vehicle,
  type Violation,
} from "@/lib/mockFleet";
import { Users, Car, AlertTriangle, Wallet, Trash2, CheckCircle2, Plus, FileText } from "lucide-react";
import { formatKes, mockFineLedger, mockHireContracts, rentalFleet } from "@/lib/rentalFlow";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — Ritah" },
      {
        name: "description",
        content:
          "Ritah admin dashboard: pilot signups, fleet overview, NTSA violation log, and escrow monitoring.",
      },
      { property: "og:title", content: "Admin Control Center — Ritah" },
      {
        property: "og:description",
        content:
          "Operations cockpit for Ritah pilot fleets — signups, escrow, and live violation settlements.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [fleet, setFleet] = useState<Vehicle[]>(() => seedFleet());
  const [violations, setViolations] = useState<Violation[]>([]);
  const [ownerContracts, setOwnerContracts] = useState(mockHireContracts);

  useEffect(() => {
    const refresh = () => setSignups(getSignups());
    refresh();
    window.addEventListener("ritah:signups-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ritah:signups-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFleet((prev) => {
        const next = tickFleet(prev);
        const v = maybeGenerateViolation(next);
        if (v) setViolations((vs) => [v, ...vs].slice(0, 50));
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalEscrow = fleet.reduce((s, v) => s + v.stake, 0);
  const settled = violations.filter((v) => v.status === "AUTO-SETTLED");
  const totalSettled = settled.reduce((s, v) => s + v.amount, 0);
  const ownerFineTotal = mockFineLedger.reduce((sum, fine) => sum + fine.amount, 0);
  const requestedContracts = ownerContracts.filter((contract) => contract.status === "REQUESTED");

  const approveContract = (id: string) => {
    setOwnerContracts((prev) => prev.map((contract) => (contract.id === id ? { ...contract, status: "APPROVED" } : contract)));
  };

  const createAdminContract = () => {
    const car = rentalFleet.find((item) => item.ownerListed && item.available) ?? rentalFleet[0];
    setOwnerContracts((prev) => [
      {
        id: `contract-admin-${prev.length + 1}`,
        carId: car.id,
        renter: "Walk-in renter",
        renterEmail: "walkin.renter@example.co.ke",
        renterPhone: "+254 711 000 321",
        delegatedTo: "+254 711 000 321 · walkin.renter@example.co.ke",
        stake: car.stake,
        ratePerDay: car.ratePerDay,
        status: "APPROVED",
        createdAt: "Admin now",
      },
      ...prev,
    ]);
  };

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
            Admin · Control center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Operations <span className="text-gradient-neon">Cockpit</span>
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Kpi
            icon={<Users className="h-4 w-4" />}
            label="Pilot Signups"
            value={signups.length.toString()}
            tone="neon"
          />
          <Kpi
            icon={<Car className="h-4 w-4" />}
            label="Active Vehicles"
            value={fleet.length.toString()}
            tone="lime"
          />
          <Kpi
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Violations (session)"
            value={violations.length.toString()}
            tone="danger"
          />
          <Kpi
            icon={<Wallet className="h-4 w-4" />}
            label="Escrow Liquidity"
            value={`KES ${totalEscrow.toLocaleString()}`}
            tone="lime"
          />
        </div>

        <section className="mb-5 glass rounded-2xl p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold"><FileText className="mr-2 inline h-4 w-4 text-[var(--neon)]" />Admin-only hire contracts</h2>
              <p className="mt-1 text-xs text-muted-foreground">Owner creates contracts and approves renter requests tied to phone and email delegation.</p>
            </div>
            <button onClick={createAdminContract} className="rounded-lg bg-[var(--neon)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)]"><Plus className="mr-1 inline h-4 w-4" />Create contract</button>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {ownerContracts.map((contract) => {
              const car = rentalFleet.find((item) => item.id === contract.carId);
              return (
                <div key={contract.id} className="rounded-xl border border-border bg-background/30 p-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="font-mono text-[var(--neon)]">{contract.id}</div><div className="mt-1 font-semibold">{car?.reg} · {car?.make} {car?.model}</div></div>
                    <span className={contract.status === "REQUESTED" ? "text-[var(--danger)]" : "text-[var(--lime)]"}>{contract.status}</span>
                  </div>
                  <div className="mt-2 text-muted-foreground" suppressHydrationWarning>{contract.renter} · {contract.renterPhone} · {contract.renterEmail}</div>
                  <div className="mt-2 text-foreground">Stake {formatKes(contract.stake)} · Rate {formatKes(contract.ratePerDay)}/day</div>
                  {contract.status === "REQUESTED" && <button onClick={() => approveContract(contract.id)} className="mt-3 rounded-lg border border-[var(--lime)]/40 bg-[var(--lime)]/10 px-3 py-2 text-[11px] font-bold text-[var(--lime)]"><CheckCircle2 className="mr-1 inline h-4 w-4" />Approve request</button>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Pending owner approvals: <span className="text-foreground">{requestedContracts.length}</span></div>
        </section>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Signups */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--neon)]" />
                <span className="text-sm font-semibold">Pilot Signups</span>
              </div>
              {signups.length > 0 && (
                <button
                  onClick={() => {
                    clearSignups();
                    setSignups([]);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-[var(--danger)] transition"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {signups.length === 0 && (
                <div className="text-xs font-mono text-muted-foreground py-8 text-center">
                  No signups yet. Submit the form on the home page.
                </div>
              )}
              {signups.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-md bg-black/30 px-3 py-2 border border-white/5 text-xs font-mono"
                >
                  <span>{s.email}</span>
                  <span className="text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet table */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-4 w-4 text-[var(--lime)]" />
              <span className="text-sm font-semibold">Active Delegations</span>
            </div>
            <div className="space-y-1.5">
              {fleet.map((v) => (
                <div
                  key={v.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-black/30 px-3 py-2 border border-white/5 text-xs font-mono"
                >
                  <div>
                    <div className="text-foreground">{v.reg}</div>
                    <div className="text-muted-foreground text-[10px]">{v.driver}</div>
                  </div>
                  <span
                    style={{
                      color:
                        v.status === "VIOLATION"
                          ? "var(--danger)"
                          : v.status === "WARN"
                          ? "var(--lime)"
                          : "var(--neon)",
                    }}
                  >
                    {v.speed} km/h
                  </span>
                  <span className="text-[var(--lime)]">
                    KES {v.stake.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Violation ledger */}
        <div className="mt-5 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
              <span className="text-sm font-semibold">Blockchain Ledger · Settlements</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--lime)]">
              Σ KES {totalSettled.toLocaleString()} settled
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="py-2 pr-4">TIME</th>
                  <th className="py-2 pr-4">REG</th>
                  <th className="py-2 pr-4">DRIVER</th>
                  <th className="py-2 pr-4">VIOLATION</th>
                  <th className="py-2 pr-4 text-right">AMOUNT</th>
                  <th className="py-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {violations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Listening for NTSA events…
                    </td>
                  </tr>
                )}
                {violations.map((v) => (
                  <tr key={v.id} className="border-t border-white/5">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(v.ts).toLocaleTimeString()}
                    </td>
                    <td className="py-2 pr-4">{v.reg}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{v.driver}</td>
                    <td className="py-2 pr-4 text-[var(--danger)]">{v.type}</td>
                    <td className="py-2 pr-4 text-right text-[var(--lime)]">
                      KES {v.amount.toLocaleString()}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{
                        color:
                          v.status === "AUTO-SETTLED"
                            ? "var(--lime)"
                            : "var(--neon)",
                      }}
                    >
                      {v.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-5">
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold"><Car className="inline h-4 w-4 mr-2 text-[var(--neon)]" />Owner hire contracts</h2>
              <span className="text-[11px] font-mono text-[var(--lime)]">ADMIN / OWNER REVIEW</span>
            </div>
            <div className="space-y-2">
              {ownerContracts.map((contract) => {
                const car = rentalFleet.find((item) => item.id === contract.carId);
                return <div key={contract.id} className="rounded-lg border border-border bg-background/30 p-3 text-xs"><div className="flex justify-between gap-3"><span className="font-mono text-[var(--neon)]">{car?.reg}</span><span className={contract.status === "ACTIVE" ? "text-[var(--lime)]" : "text-muted-foreground"}>{contract.status}</span></div><div className="mt-1 text-muted-foreground">{contract.renter} · {contract.delegatedTo}</div><div className="mt-1 text-foreground">Stake {formatKes(contract.stake)} · Rate {formatKes(contract.ratePerDay)}/day</div></div>;
              })}
            </div>
          </section>

          <FineLedgerPanel title={`Owner fine ledger · Σ ${formatKes(ownerFineTotal)}`} fines={mockFineLedger} />
        </div>
      </div>
    </main>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "neon" | "lime" | "danger";
}) {
  const color =
    tone === "neon"
      ? "var(--neon)"
      : tone === "lime"
      ? "var(--lime)"
      : "var(--danger)";
  return (
    <div className="glass rounded-2xl p-5">
      <div
        className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"
        style={{ color }}
      >
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-display font-bold">{value}</div>
    </div>
  );
}
