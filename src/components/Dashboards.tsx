import { motion } from "framer-motion";
import { Car, User, Activity } from "lucide-react";

export default function Dashboards() {
  return (
    <section id="dashboards" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-3">
            03 — Built for every seat
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Three portals.{" "}
            <span className="text-gradient-neon">One shielded fleet.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Company Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Car className="h-5 w-5 text-[var(--neon)]" />
              <span className="text-sm font-semibold">Company Portal</span>
            </div>
            <div className="space-y-3">
              <MockField label="REG NO" value="KDM 421X" />
              <MockField label="INSURANCE" value="Comprehensive · Jubilee" />
              <MockField label="MILEAGE" value="48,201 km" />
              <button className="w-full mt-2 rounded-lg bg-[var(--neon)] text-[var(--primary-foreground)] py-2.5 text-sm font-semibold">
                Quick-Reg Vehicle
              </button>
            </div>
          </motion.div>

          {/* Customer App */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass rounded-2xl p-6 lime-border"
          >
            <div className="flex items-center gap-2 mb-5">
              <User className="h-5 w-5 text-[var(--lime)]" />
              <span className="text-sm font-semibold">Customer App</span>
            </div>
            <div className="rounded-xl bg-black/30 p-4 border border-white/5">
              <div className="text-xs text-muted-foreground mb-1">Liability Stake</div>
              <div className="text-3xl font-display font-bold text-gradient-neon">
                KES 8,500
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-[var(--neon)] to-[var(--lime)]" />
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-2">
                Locked until 24h after rental ends
              </div>
            </div>
            <button className="w-full mt-4 rounded-lg glass border border-[var(--lime)]/40 text-[var(--lime)] py-2.5 text-sm font-semibold">
              Accept Digital Contract
            </button>
          </motion.div>

          {/* Admin Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Activity className="h-5 w-5 text-[var(--danger)]" />
              <span className="text-sm font-semibold">Violation Feed</span>
              <span className="ml-auto text-[10px] font-mono text-[var(--danger)]">● LIVE</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <FeedRow time="14:02" type="SPEED 92/80" amt="KES 3,000" who="J. Mwangi" />
              <FeedRow time="13:47" type="LANE INDISC." amt="KES 1,500" who="S. Otieno" />
              <FeedRow time="13:21" type="SEATBELT" amt="KES 500" who="A. Kamau" />
              <FeedRow time="12:58" type="RED LIGHT" amt="KES 5,000" who="M. Wanjiru" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/5 px-3 py-2">
      <div className="text-[10px] font-mono text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function FeedRow({
  time,
  type,
  amt,
  who,
}: {
  time: string;
  type: string;
  amt: string;
  who: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-black/30 px-2.5 py-2 border border-white/5">
      <span className="text-muted-foreground">{time}</span>
      <span className="text-[var(--danger)]">{type}</span>
      <span className="ml-auto text-[var(--lime)]">{amt}</span>
      <span className="text-muted-foreground hidden sm:inline">→ {who}</span>
    </div>
  );
}
