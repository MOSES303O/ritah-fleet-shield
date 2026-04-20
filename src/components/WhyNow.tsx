import { motion } from "framer-motion";
import { Clock, ShieldAlert, FileWarning } from "lucide-react";

const items = [
  {
    icon: Clock,
    title: "The 7-Day Ticking Clock",
    body: "NTSA now sends automated SMS fines directly to the registered vehicle owner. Unpaid for 7 days? Your entire fleet's administrative status is at risk — transfers, renewals, all blocked.",
    accent: "neon",
  },
  {
    icon: ShieldAlert,
    title: "The Insurance Risk",
    body: "Repeated violations affect premiums and can void coverage. Ritah keeps your business 'Clean' by cryptographically proving the owner was not the operator at the time of the offence.",
    accent: "lime",
  },
  {
    icon: FileWarning,
    title: "Prima Facie Liability",
    body: "Under Kenyan law, the registered owner is presumed liable. Without delegation, every customer's recklessness becomes your fine, your record, your problem.",
    accent: "danger",
  },
];

export default function WhyNow() {
  return (
    <section id="why" className="py-28 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-3">
            01 — Why Now
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Kenya's roads got{" "}
            <span className="text-gradient-neon">37 new ways</span> to fine your
            business.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 hover:translate-y-[-4px] transition-transform duration-500"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5 ${
                  it.accent === "neon"
                    ? "bg-[var(--neon)]/10 text-[var(--neon)]"
                    : it.accent === "lime"
                      ? "bg-[var(--lime)]/10 text-[var(--lime)]"
                      : "bg-[var(--danger)]/10 text-[var(--danger)]"
                }`}
              >
                <it.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {it.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
