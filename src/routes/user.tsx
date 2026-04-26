import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AlertTriangle, Download, FileText, Send, ShieldCheck, Wallet } from "lucide-react";
import Nav from "@/components/Nav";
import FineLedgerPanel from "@/components/FineLedgerPanel";
import ContractTimeline from "@/components/ContractTimeline";
import {
  customerWallet,
  formatKes,
  mockFineLedger,
  mockHireContracts,
  mockWalletHistory,
  rentalFleet,
  renterIdentity,
  STAKE_MIN,
  STAKE_MAX,
  type FleetHireBundle,
  type HireContract,
} from "@/lib/rentalFlow";
import { downloadContractPdf } from "@/lib/contractPdf";

const searchSchema = z.object({ carId: z.string().optional() });

export const Route = createFileRoute("/user")({
  validateSearch: (search) => searchSchema.parse(search),
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
  const { carId } = Route.useSearch();
  const preselectedCar = useMemo(() => rentalFleet.find((c) => c.id === carId) ?? null, [carId]);

  const [name, setName] = useState(renterIdentity.name);
  const [email, setEmail] = useState(renterIdentity.email);
  const [phone, setPhone] = useState(renterIdentity.phone);
  const [days, setDays] = useState(2);
  const [submitted, setSubmitted] = useState<HireContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState(mockHireContracts);

  // Fleet bundle hire — one stake covers many cars
  const listedFleet = useMemo(() => rentalFleet.filter((c) => c.ownerListed), []);
  const [bundleSelected, setBundleSelected] = useState<string[]>([]);
  const [bundleStake, setBundleStake] = useState(8000);
  const [bundleDays, setBundleDays] = useState(3);
  const [bundles, setBundles] = useState<FleetHireBundle[]>([]);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const toggleBundleCar = (id: string) =>
    setBundleSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submitBundle = () => {
    setBundleError(null);
    if (bundleSelected.length < 2) return setBundleError("Pick at least 2 cars to bundle.");
    if (bundleSelected.length > 10) return setBundleError("Maximum 10 cars per bundle.");
    const stake = Math.max(STAKE_MIN, Math.min(STAKE_MAX, bundleStake));
    const bundle: FleetHireBundle = {
      id: `bundle-${Date.now()}`,
      renter: name,
      renterEmail: email,
      renterPhone: phone,
      carIds: bundleSelected,
      totalStake: stake,
      perCarStake: Math.round(stake / bundleSelected.length),
      days: bundleDays,
      status: "REQUESTED",
      createdAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
    };
    setBundles((prev) => [bundle, ...prev]);
    setBundleSelected([]);
  };

  const totalFines = mockFineLedger.reduce((sum, fine) => sum + fine.amount, 0);
  const lockedStake = contracts.filter((c) => c.status === "ACTIVE").reduce((sum, c) => sum + c.stake, 0);

  const submit = () => {
    setError(null);
    if (!preselectedCar) return setError("Pick a car from the landing search first.");
    const schema = z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().max(255),
      phone: z.string().trim().min(7).max(20),
      days: z.number().int().min(1).max(preselectedCar.maxHireDays),
    });
    const parsed = schema.safeParse({ name, email, phone, days });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid details");

    const contract: HireContract = {
      id: `contract-self-${Date.now()}`,
      carId: preselectedCar.id,
      renter: name,
      renterEmail: email,
      renterPhone: phone,
      delegatedTo: `${phone} · ${email}`,
      stake: preselectedCar.stake,
      ratePerDay: preselectedCar.ratePerDay,
      status: "REQUESTED",
      createdAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
    };
    setContracts((prev) => [contract, ...prev]);
    setSubmitted(contract);
  };

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

        {/* Hire form for car selected from landing search */}
        <section className="glass rounded-2xl p-5 mb-5 lime-border">
          <div className="flex items-center gap-2 mb-3">
            <Send className="h-4 w-4 text-[var(--lime)]" />
            <h2 className="text-sm font-semibold">Fill your hire details</h2>
          </div>
          {preselectedCar ? (
            <>
              <div className="mb-4 rounded-xl border border-[var(--lime)]/40 bg-[var(--lime)]/5 p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[var(--neon)]">{preselectedCar.reg}</span>
                  <span className="text-[var(--lime)]">{preselectedCar.available ? "AVAILABLE" : "HIRED"}</span>
                </div>
                <div className="mt-1 font-display text-lg font-bold">{preselectedCar.make} {preselectedCar.model}</div>
                <div className="mt-1 text-muted-foreground">{preselectedCar.location} · {formatKes(preselectedCar.ratePerDay)}/day · stake {formatKes(preselectedCar.stake)} · max {preselectedCar.maxHireDays} days</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <Field label="Full name" value={name} onChange={setName} />
                <Field label="Email" value={email} onChange={setEmail} type="email" />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <NumField label={`Hire days (max ${preselectedCar.maxHireDays})`} value={days} onChange={setDays} />
              </div>
              {error && <div className="mt-3 text-xs text-[var(--danger)]">{error}</div>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={submit} className="rounded-lg bg-[var(--lime)] px-4 py-2.5 text-sm font-bold text-[var(--accent-foreground)]">
                  <FileText className="mr-1.5 inline h-4 w-4" />Request hire contract
                </button>
                {submitted && (
                  <button
                    onClick={() => downloadContractPdf(submitted, preselectedCar, [])}
                    className="rounded-lg border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-4 py-2.5 text-xs font-bold text-[var(--neon)]"
                  >
                    <Download className="mr-1 inline h-4 w-4" />Download agreement PDF
                  </button>
                )}
                {submitted && <span className="text-xs text-[var(--lime)]">Contract {submitted.id} · {submitted.status}</span>}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No car selected. Go to the landing page, search for a vehicle, and click <span className="text-foreground">Hire &amp; fill details</span>.
              <Link to="/" className="ml-2 underline text-[var(--neon)]">Back to landing</Link>
            </p>
          )}
        </section>

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
            {contracts.map((contract) => {
              const car = rentalFleet.find((item) => item.id === contract.carId);
              const fines = mockFineLedger.filter((f) => f.contractId === contract.id);
              return (
                <div key={contract.id} className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex justify-between gap-3">
                    <span className="font-mono text-[var(--neon)]">{car?.reg ?? "—"}</span>
                    <span className={contract.status === "ACTIVE" || contract.status === "APPROVED" ? "text-[var(--lime)]" : "text-muted-foreground"}>{contract.status}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{car?.make} {car?.model}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Stake {formatKes(contract.stake)} · Rate {formatKes(contract.ratePerDay)}/day · {contract.createdAt}</div>
                  <div className="mt-2 text-xs text-[var(--lime)]">Delegated to: <span suppressHydrationWarning>{contract.renterPhone} · {contract.renterEmail}</span></div>
                  <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3"><ContractTimeline status={contract.status} /></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contract.status === "APPROVED" && <button className="rounded-lg bg-[var(--lime)] px-3 py-2 text-xs font-bold text-[var(--accent-foreground)]">Engage approved contract</button>}
                    <button
                      onClick={() => downloadContractPdf(contract, car, fines)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-[var(--neon)]/50"
                    >
                      <Download className="mr-1 inline h-3 w-3" />Agreement PDF
                    </button>
                  </div>
                </div>
              );
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

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-border bg-background/50 px-2 py-1.5 text-foreground" />
    </label>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="rounded-md border border-border bg-background/50 px-2 py-1.5 text-foreground" />
    </label>
  );
}
