import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { addSignup } from "@/lib/signups";
import { Link } from "@tanstack/react-router";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 255) {
      setError("Enter a valid work email.");
      return;
    }
    addSignup(clean);
    setDone(true);
    setEmail("");
  };

  return (
    <section id="cta" className="py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative glass neon-border rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-4">
              Limited pilot — Nairobi car-hire fleets
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Stop paying for{" "}
              <span className="text-gradient-neon">someone else's foot.</span>
            </h2>
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
              Join the pilot. We'll integrate Ritah with your existing rental
              workflow in under 48 hours — no logbook drama, no insurance
              surprises.
            </p>

            {!done ? (
              <form
                onSubmit={submit}
                className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  placeholder="fleet@yourcompany.co.ke"
                  className="flex-1 rounded-full bg-black/40 border border-white/10 px-5 py-3 text-sm focus:outline-none focus:border-[var(--neon)] transition"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-6 py-3 font-semibold shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:scale-[1.02] transition">
                  Get Access
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--lime)]/15 border border-[var(--lime)]/40 px-5 py-3 text-sm font-mono text-[var(--lime)]"
              >
                <Check className="h-4 w-4" />
                You're on the list. We'll be in touch within 48h.
              </motion.div>
            )}
            {error && (
              <div className="mt-3 text-xs font-mono text-[var(--danger)]">
                {error}
              </div>
            )}

            <div className="mt-6 text-xs text-muted-foreground font-mono">
              No credit card · Onboarding in 48h ·{" "}
              <Link to="/admin" className="underline hover:text-[var(--neon)]">
                View admin
              </Link>{" "}
              ·{" "}
              <Link to="/tracker" className="underline hover:text-[var(--neon)]">
                Live tracker
              </Link>
            </div>
          </div>
        </motion.div>

        <footer className="mt-16 text-center text-xs text-muted-foreground font-mono">
          © 2026 Ritah Labs · Built for Kenyan fleets · Powered by smart contracts
        </footer>
      </div>
    </section>
  );
}
