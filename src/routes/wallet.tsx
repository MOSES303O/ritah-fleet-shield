import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet as WalletIcon } from "lucide-react";
import Nav from "@/components/Nav";
import AuthGate from "@/components/AuthGate";
import FineLedgerPanel from "@/components/FineLedgerPanel";
import { customerWallet, formatKes, mockFineLedger, mockWalletHistory } from "@/lib/rentalFlow";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet & Stake — Ritah" },
      { name: "description", content: "Renter wallet, locked stake, and fine ledger." },
      { property: "og:title", content: "Wallet & Stake — Ritah" },
      { property: "og:description", content: "Track wallet balance, stake, and NTSA fine deductions." },
    ],
  }),
  component: () => (
    <AuthGate roles={["renter", "admin"]}>
      <WalletPage />
    </AuthGate>
  ),
});

function WalletPage() {
  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
          Renter wallet
        </div>
        <h1 className="text-4xl font-bold">Wallet & stake</h1>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--lime)]">
              <WalletIcon className="h-4 w-4" /> Balance
            </div>
            <div className="mt-2 text-2xl font-bold">{formatKes(customerWallet.balance)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{customerWallet.holder}</div>
          </div>
          <div className="glass rounded-2xl p-5 md:col-span-2">
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-2">
              Recent activity
            </div>
            <div className="space-y-2 text-sm">
              {mockWalletHistory.map((h) => (
                <div key={h.id} className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">{h.type} · {h.note}</span>
                  <span>{formatKes(h.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FineLedgerPanel title="NTSA fine ledger" fines={mockFineLedger} />
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex rounded-full border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-5 py-2 text-sm font-mono text-[var(--neon)]"
          >
            Browse cars to hire →
          </Link>
        </div>
      </div>
    </main>
  );
}
