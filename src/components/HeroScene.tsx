import { Car, FileCheck2, MapPin, ShieldCheck, Siren, WalletCards } from "lucide-react";

const nodes = [
  { label: "Owner fleet", icon: Car, x: "15%", y: "30%", tone: "text-[var(--neon)]" },
  { label: "Renter assigned", icon: FileCheck2, x: "58%", y: "22%", tone: "text-[var(--lime)]" },
  { label: "NTSA event", icon: Siren, x: "76%", y: "60%", tone: "text-[var(--danger)]" },
  { label: "Wallet settlement", icon: WalletCards, x: "28%", y: "72%", tone: "text-[var(--lime)]" },
];

export default function HeroScene() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-secondary/20">
      <div className="absolute inset-0 grid-bg opacity-80" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background/20" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M15 30 C35 10, 45 16, 58 22 S82 40, 76 60 S46 86, 28 72 S2 50, 15 30" fill="none" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M18 54 L40 45 L62 55 L84 38" fill="none" stroke="var(--neon)" strokeWidth="0.35" opacity="0.6" />
      </svg>
      {nodes.map(({ label, icon: Icon, x, y, tone }) => (
        <div key={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
          <div className="glass flex min-w-32 items-center gap-2 rounded-xl px-3 py-2 text-xs font-mono">
            <Icon className={`h-4 w-4 ${tone}`} />
            <span>{label}</span>
          </div>
        </div>
      ))}
      <div className="absolute inset-x-8 bottom-16 rounded-2xl border border-border bg-background/55 p-4 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--lime)]"><ShieldCheck className="h-4 w-4" /> Delegated liability contract</div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="rounded-lg bg-secondary/50 px-2 py-2">KDM 421X</span>
          <span className="rounded-lg bg-secondary/50 px-2 py-2">+254 assigned</span>
          <span className="rounded-lg bg-secondary/50 px-2 py-2">Fine ledger live</span>
        </div>
      </div>
      <MapPin className="float-y absolute right-10 top-14 h-8 w-8 text-[var(--neon)]" />
    </div>
  );
}