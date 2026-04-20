import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-6 w-6 text-[var(--neon)]" />
              <span className="absolute inset-0 blur-md bg-[var(--neon)] opacity-40 rounded-full" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Ritah<span className="text-[var(--neon)]">.</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/#why" className="hover:text-foreground transition">Why Now</a>
            <a href="/#features" className="hover:text-foreground transition">How it works</a>
            <a href="/#flow" className="hover:text-foreground transition">Flow</a>
            <Link to="/tracker" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Tracker</Link>
            <Link to="/admin" className="hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Admin</Link>
          </nav>
          <a
            href="/#cta"
            className="rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-[0_0_20px_rgba(0,217,255,0.45)]"
          >
            Request Demo
          </a>
        </div>
      </div>
    </header>
  );
}
