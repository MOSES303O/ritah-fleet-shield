import { motion } from "framer-motion";
import HeroScene from "./HeroScene";
import { ArrowRight, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] pulse-ring" />
            NTSA Instant Fine System — Live since 2025
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95]">
            NTSA Instant Fines:{" "}
            <span className="text-gradient-neon">
              Don't let your customer's speeding block your fleet.
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Ritah bridges NTSA's automated enforcement and your business's
            bottom line. Protect your logbooks and insurance standing with
            blockchain-automated liability delegation.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-6 py-3 font-semibold shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:scale-[1.02] transition"
            >
              Shield My Fleet
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-medium text-foreground hover:bg-white/5 transition"
            >
              <Zap className="h-4 w-4 text-[var(--lime)]" />
              See how it works
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { v: "37", l: "Violations detected" },
              { v: "7d", l: "Settlement window" },
              { v: "<2s", l: "Auto-settle time" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-xl px-4 py-3">
                <div className="text-2xl font-display font-bold text-gradient-neon">
                  {s.v}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[460px] md:h-[560px] rounded-3xl overflow-hidden glass neon-border"
        >
          <HeroScene />
          <div className="absolute top-4 left-4 glass rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--neon)]">
            ● LIVE • Stake locked: KES 8,500
          </div>
          <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--lime)]">
            Smart contract → fleet wallet
          </div>
        </motion.div>
      </div>
    </section>
  );
}
