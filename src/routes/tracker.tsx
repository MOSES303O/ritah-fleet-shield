import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import {
  type Vehicle,
  type Violation,
  seedFleet,
  tickFleet,
  maybeGenerateViolation,
  project,
} from "@/lib/mockFleet";
import { Activity, MapPin, Gauge } from "lucide-react";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Live Fleet Tracker — Ritah" },
      {
        name: "description",
        content:
          "Real-time fleet tracker showing speed, location, and NTSA violations across your shielded vehicles.",
      },
      { property: "og:title", content: "Live Fleet Tracker — Ritah" },
      {
        property: "og:description",
        content:
          "Watch every shielded vehicle in real time. Speed, GPS, and instant fine settlements in one feed.",
      },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  const [fleet, setFleet] = useState<Vehicle[]>(() => seedFleet());
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setFleet((prev) => {
        const next = tickFleet(prev);
        const v = maybeGenerateViolation(next);
        if (v) setViolations((vs) => [v, ...vs].slice(0, 25));
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const sel = fleet.find((v) => v.id === selected) ?? fleet[0];
  const totalFines = violations.reduce((s, v) => s + v.amount, 0);

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
              Live · Nairobi grid
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Fleet <span className="text-gradient-neon">Tracker</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--danger)]/10 border border-[var(--danger)]/40 px-3 py-1.5 text-[var(--danger)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
              LIVE
            </span>
            <span className="text-muted-foreground">
              {fleet.length} vehicles · {violations.length} events
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Map */}
          <div className="lg:col-span-2 glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="relative aspect-[4/3] w-full">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                {/* faux roads */}
                <g stroke="oklch(0.82 0.18 195 / 0.15)" strokeWidth="0.3" fill="none">
                  <path d="M0 30 Q 50 20 100 35" />
                  <path d="M0 60 Q 50 70 100 55" />
                  <path d="M20 0 Q 30 50 25 100" />
                  <path d="M70 0 Q 65 50 75 100" />
                </g>
                {fleet.map((v) => {
                  const { x, y } = project(v.lat, v.lng);
                  const color =
                    v.status === "VIOLATION"
                      ? "var(--danger)"
                      : v.status === "WARN"
                      ? "var(--lime)"
                      : "var(--neon)";
                  return (
                    <g
                      key={v.id}
                      onClick={() => setSelected(v.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle cx={x} cy={y} r="2.5" fill={color} opacity={0.25}>
                        <animate
                          attributeName="r"
                          values="2.5;5;2.5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx={x} cy={y} r="1.4" fill={color} />
                      {sel?.id === v.id && (
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="none"
                          stroke="white"
                          strokeWidth="0.4"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground">
                NAIROBI · simulated GPS feed
              </div>
            </div>
          </div>

          {/* Selected vehicle */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-4 w-4 text-[var(--neon)]" />
              <span className="text-sm font-semibold">Vehicle Detail</span>
            </div>
            {sel && (
              <>
                <div className="text-2xl font-display font-bold">{sel.reg}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1">
                  Driver · {sel.driver}
                </div>
                <div className="mt-5 rounded-xl bg-black/30 border border-white/5 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      SPEED
                    </span>
                    <span
                      className="text-3xl font-display font-bold"
                      style={{
                        color:
                          sel.status === "VIOLATION"
                            ? "var(--danger)"
                            : sel.status === "WARN"
                            ? "var(--lime)"
                            : "var(--neon)",
                      }}
                    >
                      {sel.speed}
                      <span className="text-sm text-muted-foreground ml-1">
                        / {sel.limit} km/h
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      animate={{ width: `${Math.min(100, (sel.speed / sel.limit) * 100)}%` }}
                      className="h-full"
                      style={{
                        background:
                          sel.status === "VIOLATION"
                            ? "var(--danger)"
                            : "linear-gradient(90deg, var(--neon), var(--lime))",
                      }}
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Mini label="STAKE" value={`KES ${sel.stake.toLocaleString()}`} />
                  <Mini label="STATUS" value={sel.status} tone={sel.status} />
                </div>
                <div className="mt-3 rounded-lg bg-black/30 border border-white/5 p-3 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[var(--neon)]" />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {sel.lat.toFixed(4)}, {sel.lng.toFixed(4)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Violation feed */}
        <div className="mt-5 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--danger)]" />
              <span className="text-sm font-semibold">Live Violation Feed</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--lime)]">
              Σ KES {totalFines.toLocaleString()} auto-settled
            </span>
          </div>
          <div className="space-y-1.5 font-mono text-xs max-h-80 overflow-y-auto">
            <AnimatePresence initial={false}>
              {violations.length === 0 && (
                <div className="text-muted-foreground py-6 text-center">
                  Awaiting first event...
                </div>
              )}
              {violations.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-md bg-black/30 px-3 py-2 border border-white/5"
                >
                  <span className="text-muted-foreground">
                    {new Date(v.ts).toLocaleTimeString()}
                  </span>
                  <span className="text-foreground">{v.reg}</span>
                  <span className="text-[var(--danger)]">{v.type}</span>
                  <span className="ml-auto text-[var(--lime)]">
                    KES {v.amount.toLocaleString()}
                  </span>
                  <span
                    className={
                      v.status === "AUTO-SETTLED"
                        ? "text-[var(--lime)]"
                        : "text-[var(--neon)]"
                    }
                  >
                    {v.status}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "OK" | "WARN" | "VIOLATION";
}) {
  const color =
    tone === "VIOLATION"
      ? "var(--danger)"
      : tone === "WARN"
      ? "var(--lime)"
      : "var(--neon)";
  return (
    <div className="rounded-lg bg-black/30 border border-white/5 p-3">
      <div className="text-[10px] font-mono text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold" style={tone ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
