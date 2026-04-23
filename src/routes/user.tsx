import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, FileText, ShieldCheck, Wallet } from "lucide-react";
import Nav from "@/components/Nav";
import FineLedgerPanel from "@/components/FineLedgerPanel";
import { customerWallet, formatKes, mockFineLedger, mockHireContracts, mockWalletHistory, rentalFleet, renterIdentity } from "@/lib/rentalFlow";

export const Route = createFileRoute("/user")({
  head: () => ({
    meta: [
      { title: "User Wallet & Fine Ledger — Ritah" },
      { name: "description", content: "Mock renter page for wallet history, NTSA fine deductions, and active hire contract records." },
      { property: "og:title", content: "User Wallet & Fine Ledger — Ritah" },
      { property: "og:description", content: "Track mock renter wallet transactions, fine deductions, and hire contracts in Ritah." },
    ],
  }),
  component: UserPage,
});

function UserPage() {
  const totalFines = mockFineLedger.reduce((sum, fine) => sum + fine.amount, 0);
  const lockedStake = mockHireContracts.filter((contract) => contract.status === "ACTIVE").reduce((sum, contract) => sum + contract.stake, 0);

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-2">Logged-in renter · mock session</div>
            <h1 className="text-4xl md:text-5xl font-bold">User wallet and fine ledger</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">A simulated logged-in renter account showing wallet funds, contract delegation by phone/email, NTSA auto-deductions, and hire records.</p>
          </div>
          <Link to="/contracts" className="rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-5 py-2.5 text-sm font-semibold">Open contracts</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <Metric icon={<Wallet className="h-4 w-4" />} label="Wallet balance" value={formatKes(customerWallet.balance)} />
          <Metric icon={<ShieldCheck className="h-4 w-4" />} label="Locked stake" value={formatKes(lockedStake)} />
          <Metric icon={<AlertTriangle className="h-4 w-4" />} label="Fine deductions" value={formatKes(totalFines)} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-xl font-bold mb-4"><Wallet className="inline h-5 w-5 mr-2 text-[var(--lime)]" />Wallet transaction history</h2>
            <div className="space-y-2">
              {mockWalletHistory.map((entry) => (
                <div key={entry.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-border bg-background/30 p-3 text-xs">
                  <div><div className="font-mono text-[var(--neon)]">{entry.type}</div><div className="text-muted-foreground">{entry.note}</div></div>
                  <div className="text-right"><div className="font-semibold">{formatKes(entry.amount)}</div><div className="text-muted-foreground">{entry.createdAt}</div></div>
                </div>
              ))}
            </div>
          </section>

          <FineLedgerPanel title="User fine ledger" fines={mockFineLedger} />
        </div>

        <section className="mt-5 glass rounded-2xl p-5">
          <h2 className="font-display text-xl font-bold mb-4"><FileText className="inline h-5 w-5 mr-2 text-[var(--neon)]" />Hire contract summary</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {mockHireContracts.map((contract) => {
              const car = rentalFleet.find((item) => item.id === contract.carId);
              return <div key={contract.id} className="rounded-xl border border-border bg-background/30 p-4"><div className="flex justify-between gap-3"><span className="font-mono text-[var(--neon)]">{car?.reg}</span><span className={contract.status === "ACTIVE" || contract.status === "APPROVED" ? "text-[var(--lime)]" : "text-muted-foreground"}>{contract.status}</span></div><div className="mt-2 text-sm font-semibold">{car?.make} {car?.model}</div><div className="mt-1 text-xs text-muted-foreground">Stake {formatKes(contract.stake)} · Rate {formatKes(contract.ratePerDay)}/day · {contract.createdAt}</div><div className="mt-2 text-xs text-[var(--lime)]" suppressHydrationWarning>Available to engage: {contract.renterPhone} · {contract.renterEmail}</div>{contract.status === "APPROVED" && <button className="mt-3 rounded-lg bg-[var(--lime)] px-3 py-2 text-xs font-bold text-[var(--accent-foreground)]">Engage approved contract</button>}</div>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="glass rounded-2xl p-5"><div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--lime)]">{icon}{label}</div><div className="mt-2 text-2xl font-display font-bold">{value}</div></div>;
}