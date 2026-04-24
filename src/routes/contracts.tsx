import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Download, FileText, Mail, Phone, ShieldCheck, Wallet } from "lucide-react";
import Nav from "@/components/Nav";
import ContractTimeline from "@/components/ContractTimeline";
import { formatKes, mockFineLedger, mockHireContracts, rentalFleet } from "@/lib/rentalFlow";
import { downloadContractPdf } from "@/lib/contractPdf";

export const Route = createFileRoute("/contracts")({
  head: () => ({
    meta: [
      { title: "Hire Contracts — Ritah" },
      { name: "description", content: "Mock hire contract records with stake, vehicle, wallet, and NTSA fine settlement details." },
      { property: "og:title", content: "Hire Contracts — Ritah" },
      { property: "og:description", content: "Review renter hire contracts, locked stake, vehicle rules, and auto-deducted fines." },
    ],
  }),
  component: ContractsPage,
});

function ContractsPage() {
  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">Smart-contract records · mock data</div>
            <h1 className="text-4xl md:text-5xl font-bold">Hire contract page</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Owner/admin-only mock records tie a renter, vehicle, stake lock, delegation contact, availability rules, and NTSA fine deductions into one auditable flow.</p>
          </div>
          <Link to="/user" className="rounded-full border border-[var(--lime)]/40 bg-[var(--lime)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--lime)]">User ledger</Link>
        </div>

        <div className="space-y-5">
          {mockHireContracts.map((contract) => {
            const car = rentalFleet.find((item) => item.id === contract.carId);
            const fines = mockFineLedger.filter((fine) => fine.contractId === contract.id);
            const fineTotal = fines.reduce((sum, fine) => sum + fine.amount, 0);
            return (
              <section key={contract.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-mono text-sm text-[var(--neon)]">{contract.id}</div>
                    <h2 className="mt-1 text-2xl font-display font-bold">{car?.make} {car?.model} · {car?.reg}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Renter {contract.renter} · created {contract.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={contract.status === "ACTIVE" ? "rounded-full bg-[var(--lime)]/10 border border-[var(--lime)]/40 px-4 py-2 text-xs font-mono text-[var(--lime)]" : "rounded-full border border-border px-4 py-2 text-xs font-mono text-muted-foreground"}>{contract.status}</span>
                    <button onClick={() => downloadContractPdf(contract, car, fines)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-3 py-2 text-xs font-mono text-[var(--neon)] hover:bg-[var(--neon)]/20"><Download className="h-3 w-3" />PDF</button>
                  </div>
                </div>

                <div className="mt-5 grid md:grid-cols-4 gap-3">
                  <Mini icon={<Wallet className="h-4 w-4" />} label="Locked stake" value={formatKes(contract.stake)} />
                  <Mini icon={<FileText className="h-4 w-4" />} label="Daily rate" value={formatKes(contract.ratePerDay)} />
                  <Mini icon={<CheckCircle2 className="h-4 w-4" />} label="Pickup hours" value={car?.allowedHours ?? "—"} />
                  <Mini icon={<AlertTriangle className="h-4 w-4" />} label="Fine total" value={formatKes(fineTotal)} />
                </div>

                <div className="mt-5 grid md:grid-cols-3 gap-3 rounded-xl border border-[var(--neon)]/30 bg-[var(--neon)]/10 p-4 text-xs">
                  <div><div className="inline-flex items-center gap-2 font-mono text-[var(--neon)]"><ShieldCheck className="h-4 w-4" /> Delegated renter</div><div className="mt-1 text-foreground">{contract.renter}</div></div>
                  <div><div className="inline-flex items-center gap-2 font-mono text-[var(--neon)]"><Phone className="h-4 w-4" /> Assigned number</div><div className="mt-1 text-foreground">{contract.renterPhone}</div></div>
                  <div><div className="inline-flex items-center gap-2 font-mono text-[var(--neon)]"><Mail className="h-4 w-4" /> Assigned email</div><div className="mt-1 text-foreground">{contract.renterEmail}</div></div>
                </div>

                <div className="mt-5 rounded-xl border border-border bg-background/30 p-4">
                  <div className="mb-3 text-[11px] font-mono uppercase tracking-widest text-[var(--lime)]">Contract state timeline</div>
                  <ContractTimeline status={contract.status} />
                </div>

                <div className="mt-5 grid lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <h3 className="text-sm font-semibold mb-3">Availability rules</h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div>Maximum hire: {car?.maxHireDays} days</div>
                      <div>Wallet minimum: {formatKes(car?.requiresWalletMinimum ?? 0)}</div>
                      <div>Speed limit trigger: {car?.speedLimit} km/h</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <h3 className="text-sm font-semibold mb-3">Fine deductions</h3>
                    <div className="space-y-2 text-xs">
                      {fines.length === 0 && <div className="text-muted-foreground">No fines attached to this contract.</div>}
                      {fines.map((fine) => <div key={fine.id} className="flex justify-between gap-3 border-t border-border pt-2"><span className="text-[var(--danger)]">{fine.reason}</span><span>{formatKes(fine.amount)}</span></div>)}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background/30 p-4"><div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--lime)]">{icon}{label}</div><div className="mt-2 font-semibold">{value}</div></div>;
}