import { Car, FileCheck2, ShieldCheck, WalletCards } from "lucide-react";

const routePoints = [
  { x: 15, y: 72, label: "Owner login", icon: ShieldCheck },
  { x: 38, y: 36, label: "Fleet listed", icon: Car },
  { x: 64, y: 61, label: "Hire contract", icon: FileCheck2 },
  { x: 86, y: 28, label: "Wallet fine", icon: WalletCards },
];

export default function HeroScene() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-secondary/20">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M8 82 C24 54 31 35 45 42 S62 78 78 49 S91 24 98 20" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
        <path d="M8 82 C24 54 31 35 45 42 S62 78 78 49 S91 24 98 20" fill="none" stroke="var(--neon)" strokeWidth="1.2" strokeDasharray="4 5" strokeLinecap="round" />
      </svg>

      {routePoints.map(({ x, y, label, icon: Icon }, index) => (
        <div key={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--neon)]/45 bg-background/80 shadow-[0_0_28px_oklch(0.82_0.18_195_/_0.28)] backdrop-blur">
            <Icon className="h-6 w-6 text-[var(--lime)]" />
          </div>
          <div className="mt-2 whitespace-nowrap rounded-md border border-border bg-background/80 px-2 py-1 text-center text-[10px] font-mono text-muted-foreground backdrop-blur">
            0{index + 1} · {label}
          </div>
        </div>
      ))}

      <div className="absolute left-[30%] top-[58%] rounded-xl border border-[var(--lime)]/35 bg-[var(--lime)]/10 px-4 py-3 text-xs text-[var(--lime)] backdrop-blur">
        KDM 421X available
      </div>
      <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-muted-foreground">
        <div className="rounded-lg border border-border bg-background/55 px-2 py-3">SEARCH PLATES</div>
        <div className="rounded-lg border border-border bg-background/55 px-2 py-3">LOCK STAKE</div>
        <div className="rounded-lg border border-border bg-background/55 px-2 py-3">AUTO-DEDUCT</div>
      </div>
    </div>
  );
}