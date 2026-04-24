import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { formatKes, rentalFleet } from "@/lib/rentalFlow";

export default function LandingSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<string>("ALL");

  const locations = useMemo(() => ["ALL", ...Array.from(new Set(rentalFleet.map((c) => c.location)))], []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rentalFleet.filter((car) => {
      if (!car.ownerListed) return false;
      if (location !== "ALL" && car.location !== location) return false;
      if (!needle) return true;
      return `${car.reg} ${car.make} ${car.model} ${car.location}`.toLowerCase().includes(needle);
    });
  }, [query, location]);

  return (
    <section id="search" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 text-xs font-mono uppercase tracking-widest text-[var(--lime)]">
            Search car availability
          </div>
          <h2 className="text-4xl font-bold md:text-5xl">Find a vehicle by plate or pickup area.</h2>
          <p className="mt-3 text-muted-foreground">
            Search the live fleet, then continue to your renter page to fill in your details and request the hire contract.
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search number plate, make, model…"
                className="w-full rounded-lg border border-border bg-background/45 py-3 pl-10 pr-4 text-sm focus:border-[var(--lime)] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-mono transition ${
                    location === loc
                      ? "border-[var(--neon)]/60 bg-[var(--neon)]/10 text-[var(--neon)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.length === 0 && (
              <div className="rounded-xl border border-border bg-background/30 p-6 text-center text-xs text-muted-foreground md:col-span-2 lg:col-span-3">
                No vehicles match your search. Try clearing filters.
              </div>
            )}
            {results.map((car) => (
              <article key={car.id} className="rounded-2xl border border-border bg-background/35 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[var(--neon)]">{car.reg}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${car.available ? "border-[var(--lime)]/40 bg-[var(--lime)]/10 text-[var(--lime)]" : "border-border text-muted-foreground"}`}>
                    {car.available ? "AVAILABLE" : "HIRED"}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold">{car.make} {car.model}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{car.location} · {car.seats} seats · {formatKes(car.ratePerDay)}/day</div>
                <div className="mt-2 text-[11px] text-muted-foreground">Stake {formatKes(car.stake)} · Wallet min {formatKes(car.requiresWalletMinimum)}</div>
                <Link
                  to="/user"
                  search={{ carId: car.id }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--lime)] px-3 py-1.5 text-[11px] font-bold text-[var(--accent-foreground)]"
                >
                  Hire & fill details <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
