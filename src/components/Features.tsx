import { motion } from "framer-motion";
import { Wallet, Link2, Zap, TimerReset } from "lucide-react";

const features = [
  {
    n: "01",
    icon: Link2,
    title: "Automated Obligation Transfer",
    body: "Register your vehicle on Ritah with insurance & NTSA logbook details. The on-chain record links liability to the active driver — not the registered owner.",
  },
  {
    n: "02",
    icon: Wallet,
    title: "Smart Stake Contract",
    body: "Customer accepts a digital invite and locks a Liability Stake of KES 5,000 – 10,000 in their Ritah wallet before driving off.",
  },
  {
    n: "03",
    icon: Zap,
    title: "Real-time Settlement",
    body: "When NTSA triggers a fine (KES 500 – 10,000), the smart contract instantly transfers funds from the customer's stake to your fleet wallet. The 7-day clock never starts.",
  },
  {
    n: "04",
    icon: TimerReset,
    title: "Smart Grace Period",
    body: "A post-rental locking window (24–48h) holds the remaining stake until any delayed NTSA notifications are captured. Then the customer withdraws cleanly.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-3">
            02 — How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Four steps from{" "}
            <span className="text-gradient-neon">key handover</span> to
            settled fine.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass rounded-2xl p-8 relative group overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 text-[7rem] font-display font-bold text-white/[0.03] select-none">
                {f.n}
              </div>
              <div className="flex items-start gap-4 relative">
                <div className="h-12 w-12 rounded-xl glass flex items-center justify-center text-[var(--neon)] shrink-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    STEP {f.n}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
