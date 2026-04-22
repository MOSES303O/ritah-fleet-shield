import { motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  Building2,
  Car,
  CheckCircle2,
  FileText,
  MinusCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  customerWallet,
  formatKes,
  getAvailabilityRules,
  ntsaFineCatalog,
  ownerProfile,
  rentalFleet,
  STAKE_MAX,
  STAKE_MIN,
  type FleetCar,
  type HireContract,
  type NtsaFine,
  type WalletLedger,
} from "@/lib/rentalFlow";

const now = () => new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

const emptyForm = {
  reg: "",
  make: "",
  model: "",
  seats: 5,
  location: "",
  ratePerDay: 4500,
  stake: 8000,
  speedLimit: 80,
  allowedHours: "06:00–22:00",
  maxHireDays: 7,
  requiresWalletMinimum: 9000,
  available: true,
};

export default function RentalWorkflow() {
  const [ownerLoggedIn, setOwnerLoggedIn] = useState(false);
  const [cars, setCars] = useState<FleetCar[]>(rentalFleet);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(rentalFleet[0]?.id ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [stake, setStake] = useState(8500);
  const [walletBalance, setWalletBalance] = useState(customerWallet.balance);
  const [walletAmount, setWalletAmount] = useState(2500);
  const [contracts, setContracts] = useState<HireContract[]>([]);
  const [fines, setFines] = useState<NtsaFine[]>([]);
  const [ledger, setLedger] = useState<WalletLedger[]>([
    { id: "seed-ledger", type: "LOAD", amount: customerWallet.balance, note: "Demo wallet opening balance", createdAt: "09:00" },
  ]);

  const availableCars = cars.filter((car) => car.available && car.ownerListed);
  const searchResults = availableCars.filter((car) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${car.reg} ${car.make} ${car.model} ${car.location}`.toLowerCase().includes(needle);
  });
  const selectedCar = cars.find((car) => car.id === selectedId) ?? availableCars[0];
  const selectedRules = selectedCar ? getAvailabilityRules(selectedCar, walletBalance) : [];
  const activeContract = contracts.find((contract) => contract.status === "ACTIVE");
  const lockedStake = contracts.filter((contract) => contract.status === "ACTIVE").reduce((sum, contract) => sum + contract.stake, 0);
  const availableWallet = walletBalance - lockedStake;
  const walletReady = customerWallet.verified && availableWallet >= stake;

  const fineTotals = useMemo(
    () => fines.reduce((sum, fine) => sum + (fine.status === "AUTO-DEDUCTED" ? fine.amount : 0), 0),
    [fines],
  );

  const addLedger = (type: WalletLedger["type"], amount: number, note: string) => {
    setLedger((prev) => [{ id: uid("ledger"), type, amount, note, createdAt: now() }, ...prev].slice(0, 6));
  };

  const listAllFleet = () => setCars((prev) => prev.map((car) => ({ ...car, ownerListed: true })));
  const toggleListed = (id: string) => {
    setCars((prev) => prev.map((car) => (car.id === id ? { ...car, ownerListed: !car.ownerListed } : car)));
  };

  const startEdit = (car: FleetCar) => {
    setEditingId(car.id);
    setForm({
      reg: car.reg,
      make: car.make,
      model: car.model,
      seats: car.seats,
      location: car.location,
      ratePerDay: car.ratePerDay,
      stake: car.stake,
      speedLimit: car.speedLimit,
      available: car.available,
    });
  };

  const saveCar = () => {
    if (!ownerLoggedIn || !form.reg.trim() || !form.make.trim() || !form.model.trim()) return;
    const payload = {
      ...form,
      stake: Math.min(STAKE_MAX, Math.max(STAKE_MIN, form.stake)),
      reg: form.reg.toUpperCase(),
    };
    if (editingId) {
      setCars((prev) => prev.map((car) => (car.id === editingId ? { ...car, ...payload } : car)));
    } else {
      const newCar: FleetCar = { id: uid("car"), ownerListed: true, ...payload };
      setCars((prev) => [newCar, ...prev]);
      setSelectedId(newCar.id);
      setStake(newCar.stake);
    }
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteCar = (id: string) => {
    setCars((prev) => prev.filter((car) => car.id !== id));
    if (selectedId === id) setSelectedId(availableCars[0]?.id ?? "");
  };

  const loadWallet = () => {
    setWalletBalance((prev) => prev + walletAmount);
    addLedger("LOAD", walletAmount, "Renter loaded fake wallet");
  };

  const withdrawWallet = () => {
    const amount = Math.min(walletAmount, Math.max(0, availableWallet));
    if (!amount) return;
    setWalletBalance((prev) => prev - amount);
    addLedger("WITHDRAW", amount, "Renter withdrew unlocked funds");
  };

  const buildContract = () => {
    if (!selectedCar || !walletReady) return;
    const contract: HireContract = {
      id: uid("contract"),
      carId: selectedCar.id,
      renter: customerWallet.holder,
      stake,
      ratePerDay: selectedCar.ratePerDay,
      status: "ACTIVE",
      createdAt: now(),
    };
    setContracts((prev) => [contract, ...prev]);
    setCars((prev) => prev.map((car) => (car.id === selectedCar.id ? { ...car, available: false } : car)));
    addLedger("STAKE LOCK", stake, `${selectedCar.reg} hire contract created`);
  };

  const simulateFine = () => {
    const contract = activeContract;
    const car = cars.find((item) => item.id === contract?.carId);
    if (!contract || !car) return;
    const catalog = ntsaFineCatalog[Math.floor(Math.random() * ntsaFineCatalog.length)];
    const canDeduct = walletBalance >= catalog.amount;
    const fine: NtsaFine = {
      id: uid("fine"),
      contractId: contract.id,
      reg: car.reg,
      reason: catalog.reason,
      speed: Math.max(catalog.speed, car.speedLimit + 12),
      limit: car.speedLimit,
      amount: catalog.amount,
      status: canDeduct ? "AUTO-DEDUCTED" : "INSUFFICIENT WALLET",
      createdAt: now(),
    };
    setFines((prev) => [fine, ...prev]);
    if (canDeduct) {
      setWalletBalance((prev) => prev - catalog.amount);
      addLedger("NTSA FINE", catalog.amount, `${car.reg} ${catalog.reason} auto-deducted`);
    }
  };

  const closeContract = (contract: HireContract) => {
    setContracts((prev) => prev.map((item) => (item.id === contract.id ? { ...item, status: "CLOSED" } : item)));
    setCars((prev) => prev.map((car) => (car.id === contract.carId ? { ...car, available: true } : car)));
  };

  return (
    <section id="rental-flow" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-3">04 — Owner-to-renter workflow</div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Login, list, search, hire — with fines and wallet deductions simulated.</h2>
          <p className="mt-4 text-muted-foreground">Mock frontend flow for owner fleet CRUD, renter wallet loading, smart-contract hire records, and NTSA instant fine auto-deductions.</p>
        </div>

        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-[var(--neon)]" />
              <div>
                <h3 className="font-display text-xl font-bold">Company owner console</h3>
                <p className="text-xs text-muted-foreground font-mono">Public mock login · CRUD enabled</p>
              </div>
            </div>

            <button onClick={() => setOwnerLoggedIn(true)} className="w-full rounded-lg bg-[var(--neon)] text-[var(--primary-foreground)] py-3 text-sm font-semibold disabled:opacity-70" disabled={ownerLoggedIn}>
              {ownerLoggedIn ? `Logged in · ${ownerProfile.company}` : "Login as fleet owner"}
            </button>

            <div className="mt-5 rounded-xl bg-secondary/40 border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-[var(--lime)]" /> Existing rental workflow integration</div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-muted-foreground">
                {["OWNER LOGIN", "CRUD FLEET", "CONTRACT", "AUTO FINE"].map((step, index) => (
                  <div key={step} className="rounded-lg border border-border bg-background/30 px-2 py-3"><span className="block text-[var(--neon)] mb-1">0{index + 1}</span>{step}</div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <button onClick={listAllFleet} disabled={!ownerLoggedIn} className="rounded-lg border border-[var(--lime)]/40 bg-[var(--lime)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--lime)] disabled:opacity-40">List entire fleet now</button>
              <button onClick={() => { setEditingId(null); setForm(emptyForm); }} disabled={!ownerLoggedIn} className="rounded-lg border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--neon)] disabled:opacity-40"><Plus className="inline h-4 w-4 mr-1" /> New car</button>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <Field label="Reg" value={form.reg} onChange={(value) => setForm((prev) => ({ ...prev, reg: value }))} disabled={!ownerLoggedIn} />
              <Field label="Make" value={form.make} onChange={(value) => setForm((prev) => ({ ...prev, make: value }))} disabled={!ownerLoggedIn} />
              <Field label="Model" value={form.model} onChange={(value) => setForm((prev) => ({ ...prev, model: value }))} disabled={!ownerLoggedIn} />
              <Field label="Pickup" value={form.location} onChange={(value) => setForm((prev) => ({ ...prev, location: value }))} disabled={!ownerLoggedIn} />
              <NumberField label="Rate/day" value={form.ratePerDay} onChange={(value) => setForm((prev) => ({ ...prev, ratePerDay: value }))} disabled={!ownerLoggedIn} />
              <NumberField label="Stake" value={form.stake} onChange={(value) => setForm((prev) => ({ ...prev, stake: value }))} disabled={!ownerLoggedIn} />
              <Field label="Allowed hours" value={form.allowedHours} onChange={(value) => setForm((prev) => ({ ...prev, allowedHours: value }))} disabled={!ownerLoggedIn} />
              <NumberField label="Max hire days" value={form.maxHireDays} onChange={(value) => setForm((prev) => ({ ...prev, maxHireDays: value }))} disabled={!ownerLoggedIn} />
              <NumberField label="Wallet minimum" value={form.requiresWalletMinimum} onChange={(value) => setForm((prev) => ({ ...prev, requiresWalletMinimum: value }))} disabled={!ownerLoggedIn} />
            </div>
            <button onClick={saveCar} disabled={!ownerLoggedIn} className="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-bold disabled:opacity-40">{editingId ? "Update fleet car" : "Create fleet listing"}</button>

            <div className="mt-5 space-y-3">
              {cars.map((car) => (
                <OwnerCarRow key={car.id} car={car} disabled={!ownerLoggedIn} onEdit={() => startEdit(car)} onDelete={() => deleteCar(car.id)} onToggle={() => toggleListed(car.id)} />
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 lime-border">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-5 w-5 text-[var(--lime)]" />
              <div>
                <h3 className="font-display text-xl font-bold">Customer hire, wallet and fines</h3>
                <p className="text-xs text-muted-foreground font-mono">Search availability · lock stake · simulate NTSA</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_0.8fr] gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by reg, model, or pickup area" className="w-full rounded-lg bg-background/45 border border-border py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--lime)]" />
                </div>
                <div className="mt-5 grid md:grid-cols-2 gap-3">
                  {searchResults.map((car) => (
                    <button key={car.id} onClick={() => { setSelectedId(car.id); setStake(car.stake); }} className={`text-left rounded-xl border p-4 transition ${selectedCar?.id === car.id ? "border-[var(--lime)] bg-[var(--lime)]/10" : "border-border bg-background/30 hover:border-[var(--neon)]/50"}`}>
                      <div className="flex items-center justify-between gap-3"><span className="font-mono text-sm text-[var(--neon)]">{car.reg}</span><span className="text-[10px] font-mono text-[var(--lime)]">AVAILABLE</span></div>
                      <div className="mt-2 font-semibold">{car.make} {car.model}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{car.location} · {car.seats} seats · {formatKes(car.ratePerDay)}/day</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-background/35 border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--neon)]"><Wallet className="h-4 w-4" /> Fake wallet simulator</div>
                <div className="mt-3 text-3xl font-display font-bold">{formatKes(walletBalance)}</div>
                <div className="text-xs text-muted-foreground">Unlocked: {formatKes(Math.max(0, availableWallet))} · Locked: {formatKes(lockedStake)}</div>
                <input type="number" min={500} step={500} value={walletAmount} onChange={(event) => setWalletAmount(Number(event.target.value))} className="mt-4 w-full rounded-lg bg-background/50 border border-border px-3 py-2 text-sm" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={loadWallet} className="rounded-lg bg-[var(--lime)] text-[var(--accent-foreground)] py-2 text-xs font-bold"><Banknote className="inline h-4 w-4 mr-1" /> Load</button>
                  <button onClick={withdrawWallet} className="rounded-lg border border-border py-2 text-xs font-bold"><MinusCircle className="inline h-4 w-4 mr-1" /> Withdraw</button>
                </div>
                <div className="mt-4 space-y-2">
                  {ledger.map((entry) => <div key={entry.id} className="text-[11px] text-muted-foreground border-t border-border pt-2"><span className="text-foreground">{entry.type}</span> · {formatKes(entry.amount)} · {entry.note}</div>)}
                </div>
              </div>
            </div>

            {selectedCar && (
              <div className="mt-6 rounded-xl bg-background/35 border border-border p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-5 justify-between">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">Selected hire</div>
                    <div className="mt-1 text-2xl font-display font-bold">{selectedCar.make} {selectedCar.model}</div>
                    <div className="text-sm text-muted-foreground">{selectedCar.reg} · pickup {selectedCar.location}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--neon)]/30 bg-[var(--neon)]/10 px-4 py-3"><div className="flex items-center gap-2 text-xs font-mono text-[var(--neon)]"><Wallet className="h-4 w-4" /> Wallet verified</div><div className="mt-1 font-semibold">{formatKes(walletBalance)}</div></div>
                </div>

                <label className="mt-6 block text-xs font-mono text-muted-foreground">Liability stake amount: <span className="text-[var(--lime)]">{formatKes(stake)}</span></label>
                <input type="range" min={STAKE_MIN} max={STAKE_MAX} step={500} value={stake} onChange={(event) => setStake(Number(event.target.value))} className="mt-3 w-full accent-[var(--lime)]" />
                <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground"><span>{formatKes(STAKE_MIN)}</span><span>{formatKes(STAKE_MAX)}</span></div>

                <div className="mt-5 grid sm:grid-cols-2 gap-2">
                  {selectedRules.map((rule) => <div key={rule.id} className="rounded-lg border border-border bg-background/30 px-3 py-2 text-xs"><div className={rule.pass ? "text-[var(--lime)]" : "text-[var(--danger)]"}>{rule.label}</div><div className="text-muted-foreground">{rule.detail}</div></div>)}
                </div>

                <button onClick={buildContract} disabled={!walletReady} className="mt-5 w-full rounded-lg bg-[var(--lime)] text-[var(--accent-foreground)] py-3 text-sm font-bold disabled:opacity-40"><FileText className="inline h-4 w-4 mr-2" />Build hire contract record</button>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {walletReady ? <><CheckCircle2 className="h-4 w-4 text-[var(--lime)]" /><span className="text-muted-foreground">Wallet can lock this stake before contract activation.</span></> : <span className="text-[var(--danger)]">Wallet balance is below the selected stake.</span>}
                </div>
              </div>
            )}

            <div className="mt-6 grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-background/35 border border-border p-4">
                <div className="flex items-center justify-between gap-3"><h4 className="font-display font-bold"><FileText className="inline h-4 w-4 mr-2 text-[var(--neon)]" />Hire contract records</h4><button onClick={simulateFine} disabled={!activeContract} className="rounded-lg bg-[var(--danger)] text-destructive-foreground px-3 py-2 text-xs font-bold disabled:opacity-40"><AlertTriangle className="inline h-4 w-4 mr-1" />Simulate NTSA fine</button></div>
                <div className="mt-3 space-y-2">
                  {contracts.length === 0 && <div className="text-sm text-muted-foreground">No hire contracts yet.</div>}
                  {contracts.map((contract) => {
                    const car = cars.find((item) => item.id === contract.carId);
                    return <div key={contract.id} className="rounded-lg border border-border bg-background/30 p-3 text-xs"><div className="flex justify-between gap-2"><span className="font-mono text-[var(--neon)]">{car?.reg ?? "Deleted car"}</span><span className={contract.status === "ACTIVE" ? "text-[var(--lime)]" : "text-muted-foreground"}>{contract.status}</span></div><div className="mt-1 text-muted-foreground">{contract.renter} · stake {formatKes(contract.stake)} · {contract.createdAt}</div>{contract.status === "ACTIVE" && <button onClick={() => closeContract(contract)} className="mt-2 text-[var(--lime)]">Close contract and release car</button>}</div>;
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-background/35 border border-border p-4">
                <h4 className="font-display font-bold"><Car className="inline h-4 w-4 mr-2 text-[var(--lime)]" />NTSA instant fine feed</h4>
                <div className="mt-2 text-xs text-muted-foreground">Auto-deducted total: {formatKes(fineTotals)}</div>
                <div className="mt-3 space-y-2">
                  {fines.length === 0 && <div className="text-sm text-muted-foreground">Run a simulated fine after a contract is active.</div>}
                  {fines.map((fine) => <div key={fine.id} className="rounded-lg border border-border bg-background/30 p-3 text-xs"><div className="flex justify-between gap-2"><span className="font-mono text-[var(--danger)]">{fine.reason}</span><span>{formatKes(fine.amount)}</span></div><div className="mt-1 text-muted-foreground">{fine.reg} · {fine.speed}/{fine.limit} km/h · {fine.status} · {fine.createdAt}</div></div>)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return <label className="text-xs text-muted-foreground">{label}<input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg bg-background/45 border border-border px-3 py-2 text-sm text-foreground disabled:opacity-40" /></label>;
}

function NumberField({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return <label className="text-xs text-muted-foreground">{label}<input type="number" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 w-full rounded-lg bg-background/45 border border-border px-3 py-2 text-sm text-foreground disabled:opacity-40" /></label>;
}

function OwnerCarRow({ car, disabled, onEdit, onDelete, onToggle }: { car: FleetCar; disabled: boolean; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/30 border border-border px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm text-[var(--neon)]">{car.reg}</div>
        <div className="truncate text-sm text-muted-foreground">{car.make} {car.model} · {car.location} · stake {formatKes(car.stake)} · {car.available ? "available" : "hired"}</div>
      </div>
      <button onClick={onToggle} disabled={disabled} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-mono transition disabled:opacity-40 ${car.ownerListed ? "bg-[var(--lime)]/15 text-[var(--lime)] border border-[var(--lime)]/35" : "bg-background/40 text-muted-foreground border border-border"}`}>{car.ownerListed ? "LISTED" : "HIDDEN"}</button>
      <button onClick={onEdit} disabled={disabled} className="rounded-full border border-border p-2 disabled:opacity-40" aria-label="Edit car"><Car className="h-4 w-4" /></button>
      <button onClick={onDelete} disabled={disabled} className="rounded-full border border-[var(--danger)]/40 p-2 text-[var(--danger)] disabled:opacity-40" aria-label="Delete car"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
