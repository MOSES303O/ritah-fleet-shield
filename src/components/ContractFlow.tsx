import { motion } from "framer-motion";
import { Building2, User, Camera, Coins } from "lucide-react";

/**
 * Animated smart-contract fund-flow visual.
 * Customer stake -> Smart contract escrow -> Company wallet -> NTSA settlement.
 */
export default function ContractFlow() {
  return (
    <section id="flow" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-3">
            04 — Smart contract flow
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Funds move{" "}
            <span className="text-gradient-neon">before the 7-day clock.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            When NTSA's camera flags a violation, Ritah's on-chain logic settles
            it directly from the customer's locked stake — no chasing, no
            insurance hits.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <Node
              icon={<User className="h-6 w-6" />}
              label="Customer"
              sub="Locks KES 8,500 stake"
              tone="lime"
              delay={0}
            />
            <Arrow delay={0.2} label="STAKE" />
            <Node
              icon={<Coins className="h-6 w-6" />}
              label="Escrow Contract"
              sub="Holds liability funds"
              tone="neon"
              delay={0.3}
              pulse
            />
            <Arrow delay={0.5} label="TRIGGER" reverse />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 items-center mt-6">
            <Node
              icon={<Camera className="h-6 w-6" />}
              label="NTSA Camera"
              sub="AI detects violation"
              tone="danger"
              delay={0.6}
            />
            <Arrow delay={0.8} label="SMS FINE" />
            <Node
              icon={<Building2 className="h-6 w-6" />}
              label="Company Wallet"
              sub="Auto-settles in <60s"
              tone="lime"
              delay={0.9}
            />
            <div className="hidden md:flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1 }}
                className="rounded-full bg-[var(--lime)]/15 border border-[var(--lime)]/40 px-4 py-2 text-xs font-mono text-[var(--lime)]"
              >
                ✓ NTSA PAID
              </motion.div>
            </div>
          </div>

          <div className="relative mt-10 grid grid-cols-3 gap-4 text-center">
            <Stat k="< 60s" v="Avg settlement" />
            <Stat k="100%" v="On-chain audit trail" />
            <Stat k="0" v="Logbook freezes" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({
  icon,
  label,
  sub,
  tone,
  delay,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  tone: "neon" | "lime" | "danger";
  delay: number;
  pulse?: boolean;
}) {
  const color =
    tone === "neon"
      ? "var(--neon)"
      : tone === "lime"
      ? "var(--lime)"
      : "var(--danger)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="rounded-2xl bg-black/40 border border-white/5 p-5 text-center"
      style={{ boxShadow: `inset 0 0 0 1px ${color}30` }}
    >
      <div
        className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 ${pulse ? "pulse-ring" : ""}`}
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-[11px] font-mono text-muted-foreground mt-1">{sub}</div>
    </motion.div>
  );
}

function Arrow({
  delay,
  label,
  reverse,
}: {
  delay: number;
  label: string;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative h-10 flex items-center justify-center"
    >
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--neon)]/50 to-transparent overflow-hidden">
        <motion.div
          animate={{ x: reverse ? ["100%", "-100%"] : ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--neon)] to-transparent"
        />
      </div>
      <span className="absolute -top-4 text-[10px] font-mono tracking-widest text-[var(--neon)]">
        {label}
      </span>
    </motion.div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-black/30 border border-white/5 py-4">
      <div className="text-2xl font-display font-bold text-gradient-neon">{k}</div>
      <div className="text-[11px] font-mono text-muted-foreground mt-1">{v}</div>
    </div>
  );
}
