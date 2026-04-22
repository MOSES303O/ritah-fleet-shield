import { motion } from "framer-motion";
import { Building2, CheckCircle2, Search, ShieldCheck, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import {
  customerWallet,
  formatKes,
  ownerProfile,
  rentalFleet,
  STAKE_MAX,
  STAKE_MIN,
  type FleetCar,
} from "@/lib/rentalFlow";

export default function RentalWorkflow() {
  const [ownerLoggedIn, setOwnerLoggedIn] = useState(false);
  const [listedIds, setListedIds] = useState(() =>
    new Set(rentalFleet.filter((car) => car.ownerListed).map((car) => car.id)),
  );
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(rentalFleet[0]?.id ?? "");
  const [stake, setStake] = useState(8500);
  const [hireStarted, setHireStarted] = useState(false);

  const cars = useMemo(
    () => rentalFleet.map((car) => ({ ...car, ownerListed: listedIds.has(car.id) })),
    [listedIds],
  );

  const availableCars = cars.filter((car) => car.available && car.ownerListed);
  const searchResults = availableCars.filter((car) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${car.reg} ${car.make} ${car.model} ${car.location}`.toLowerCase().includes(needle);
  });
  const selectedCar = cars.find((car) => car.id === selectedId) ?? availableCars[0];
  const walletReady = customerWallet.verified && customerWallet.balance >= stake;

  const listAllFleet = () => setListedIds(new Set(rentalFleet.map((car) => car.id)));
  const toggleListed = (id: string) => {
    setListedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="rental-flow" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-3">
            04 — Owner-to-renter workflow
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Login, list, search, hire — with the stake locked before keys move.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mock frontend flow for company owners and renters: fleet availability, wallet readiness,
            and configurable KES 5,000–10,000 liability staking.
          </p>
        </div>

        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-[var(--neon)]" />
              <div>
                <h3 className="font-display text-xl font-bold">Company owner console</h3>
                <p className="text-xs text-muted-foreground font-mono">Public mock login</p>
              </div>
            </div>

            <button
              onClick={() => setOwnerLoggedIn(true)}
              className="w-full rounded-lg bg-[var(--neon)] text-[var(--primary-foreground)] py-3 text-sm font-semibold disabled:opacity-70"
              disabled={ownerLoggedIn}
            >
              {ownerLoggedIn ? `Logged in · ${ownerProfile.company}` : "Login as fleet owner"}
            </button>

            <div className="mt-5 rounded-xl bg-black/30 border border-white/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-[var(--lime)]" />
                Existing rental workflow integration
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-muted-foreground">
                {['OWNER LOGIN', 'LIST FLEET', 'RENTER FINDS', 'STAKE LOCK'].map((step, index) => (
                  <div key={step} className="relative rounded-lg border border-white/5 bg-black/25 px-2 py-3">
                    <span className="block text-[var(--neon)] mb-1">0{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={listAllFleet}
                disabled={!ownerLoggedIn}
                className="flex-1 rounded-lg border border-[var(--lime)]/40 bg-[var(--lime)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--lime)] disabled:opacity-40"
              >
                List entire fleet now
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {cars.map((car) => (
                <OwnerCarRow
                  key={car.id}
                  car={car}
                  disabled={!ownerLoggedIn}
                  onToggle={() => toggleListed(car.id)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 lime-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-5 w-5 text-[var(--lime)]" />
              <div>
                <h3 className="font-display text-xl font-bold">Customer hire flow</h3>
                <p className="text-xs text-muted-foreground font-mono">Search availability then confirm wallet</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by reg, model, or pickup area"
                className="w-full rounded-lg bg-black/35 border border-white/10 py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--lime)]"
              />
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-3">
              {searchResults.map((car) => (
                <button
                  key={car.id}
                  onClick={() => {
                    setSelectedId(car.id);
                    setStake(car.stake);
                    setHireStarted(false);
                  }}
                  className={`text-left rounded-xl border p-4 transition ${
                    selectedCar?.id === car.id
                      ? "border-[var(--lime)] bg-[var(--lime)]/10"
                      : "border-white/5 bg-black/25 hover:border-[var(--neon)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm text-[var(--neon)]">{car.reg}</span>
                    <span className="text-[10px] font-mono text-[var(--lime)]">AVAILABLE</span>
                  </div>
                  <div className="mt-2 font-semibold">{car.make} {car.model}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {car.location} · {car.seats} seats · {formatKes(car.ratePerDay)}/day
                  </div>
                </button>
              ))}
            </div>

            {selectedCar && (
              <div className="mt-6 rounded-xl bg-black/30 border border-white/5 p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-5 justify-between">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">Selected hire</div>
                    <div className="mt-1 text-2xl font-display font-bold">
                      {selectedCar.make} {selectedCar.model}
                    </div>
                    <div className="text-sm text-muted-foreground">{selectedCar.reg} · pickup {selectedCar.location}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--neon)]/30 bg-[var(--neon)]/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--neon)]">
                      <Wallet className="h-4 w-4" /> Wallet verified
                    </div>
                    <div className="mt-1 font-semibold">{formatKes(customerWallet.balance)}</div>
                  </div>
                </div>

                <label className="mt-6 block text-xs font-mono text-muted-foreground">
                  Liability stake amount: <span className="text-[var(--lime)]">{formatKes(stake)}</span>
                </label>
                <input
                  type="range"
                  min={STAKE_MIN}
                  max={STAKE_MAX}
                  step={500}
                  value={stake}
                  onChange={(event) => {
                    setStake(Number(event.target.value));
                    setHireStarted(false);
                  }}
                  className="mt-3 w-full accent-[var(--lime)]"
                />
                <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{formatKes(STAKE_MIN)}</span>
                  <span>{formatKes(STAKE_MAX)}</span>
                </div>

                <button
                  onClick={() => setHireStarted(true)}
                  disabled={!walletReady}
                  className="mt-5 w-full rounded-lg bg-[var(--lime)] text-[var(--accent-foreground)] py-3 text-sm font-bold disabled:opacity-40"
                >
                  Proceed with hiring
                </button>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  {walletReady ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[var(--lime)]" />
                      <span className="text-muted-foreground">Wallet can lock this stake before contract activation.</span>
                    </>
                  ) : (
                    <span className="text-[var(--danger)]">Wallet balance is below the selected stake.</span>
                  )}
                </div>

                {hireStarted && (
                  <div className="mt-4 rounded-lg border border-[var(--lime)]/40 bg-[var(--lime)]/10 p-4 text-sm">
                    Contract ready: {formatKes(stake)} stake reserved, renter login confirmed, and
                    Ritah can attach liability delegation to the rental record instantly.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OwnerCarRow({ car, disabled, onToggle }: { car: FleetCar; disabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-black/25 border border-white/5 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm text-[var(--neon)]">{car.reg}</div>
        <div className="truncate text-sm text-muted-foreground">
          {car.make} {car.model} · {car.location} · stake {formatKes(car.stake)}
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-mono transition disabled:opacity-40 ${
          car.ownerListed
            ? "bg-[var(--lime)]/15 text-[var(--lime)] border border-[var(--lime)]/35"
            : "bg-black/30 text-muted-foreground border border-white/10"
        }`}
      >
        {car.ownerListed ? "LISTED" : "HIDDEN"}
      </button>
    </div>
  );
}