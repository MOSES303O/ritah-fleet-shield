import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Car, ShieldCheck } from "lucide-react";
import Nav from "@/components/Nav";
import AuthGate from "@/components/AuthGate";
import { formatKes, rentalFleet } from "@/lib/rentalFlow";
import { toast } from "sonner";

export const Route = createFileRoute("/hire/$carId")({
  head: () => ({
    meta: [
      { title: "Hire car — Ritah" },
      { name: "description", content: "Submit a hire contract request for this vehicle." },
      { property: "og:title", content: "Hire car — Ritah" },
      { property: "og:description", content: "Request a hire contract." },
    ],
  }),
  component: () => (
    <AuthGate roles={["renter"]}>
      <HirePage />
    </AuthGate>
  ),
});

function HirePage() {
  const { carId } = Route.useParams();
  const navigate = useNavigate();
  const car = rentalFleet.find((c) => c.id === carId);
  const [days, setDays] = useState(2);

  if (!car) {
    return (
      <main className="min-h-screen">
        <Nav />
        <div className="pt-32 mx-auto max-w-xl px-6 text-center">
          <h1 className="text-2xl font-bold">Vehicle not found</h1>
          <Link to="/" className="mt-4 inline-block text-[var(--neon)]">
            ← Back home
          </Link>
        </div>
      </main>
    );
  }

  const total = car.ratePerDay * days + car.stake;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Hire request submitted — pending owner approval");
    navigate({ to: "/wallet" });
  };

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-3xl px-6">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
          New hire request
        </div>
        <h1 className="text-4xl font-bold">
          {car.make} {car.model}
        </h1>
        <p className="text-sm text-muted-foreground">
          {car.reg} · {car.location}
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 md:col-span-2">
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--lime)]">
                Hire duration (days)
              </label>
              <input
                type="number"
                min={1}
                max={car.maxHireDays}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm outline-none"
              />
              <div className="rounded-xl border border-[var(--neon)]/30 bg-[var(--neon)]/10 p-4 text-xs">
                <div className="inline-flex items-center gap-2 text-[var(--neon)]">
                  <ShieldCheck className="h-4 w-4" /> Liability delegation
                </div>
                <p className="mt-1 text-muted-foreground">
                  Stake of {formatKes(car.stake)} will be locked. NTSA fines auto-deduct from
                  your wallet during the hire.
                </p>
              </div>
              <button className="w-full rounded-full bg-[var(--neon)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
                Submit hire request
              </button>
            </form>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="inline-flex items-center gap-2 text-[var(--neon)]">
              <Car className="h-4 w-4" />
              <span className="text-xs font-mono">Summary</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Rate × days" value={formatKes(car.ratePerDay * days)} />
              <Row label="Stake (locked)" value={formatKes(car.stake)} />
              <Row label="Wallet min" value={formatKes(car.requiresWalletMinimum)} />
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total to lock</span>
                <span>{formatKes(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
