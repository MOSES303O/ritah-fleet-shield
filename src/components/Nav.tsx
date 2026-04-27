import { Link } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";
import { logout, useSession } from "@/lib/auth";

export default function Nav() {
  const session = useSession();

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
          <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
            {!session && (
              <>
                <a href="/#why" className="hover:text-foreground transition">Why Now</a>
                <a href="/#features" className="hover:text-foreground transition">How it works</a>
              </>
            )}
            {session?.role === "owner" && (
              <>
                <Link to="/dashboard" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
                <Link to="/fleet" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Fleet</Link>
                <Link to="/contracts" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Contracts</Link>
                <Link to="/tracker" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Tracker</Link>
              </>
            )}
            {session?.role === "renter" && (
              <>
                <Link to="/wallet" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Wallet</Link>
                <Link to="/user" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Hires</Link>
              </>
            )}
            {session?.role === "admin" && (
              <Link to="/admin" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Admin</Link>
            )}
            {session && (
              <Link to="/settings" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Settings</Link>
            )}
          </nav>
          {session ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" />
              {session.name.split(" ")[0]}
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-[0_0_20px_rgba(0,217,255,0.45)]"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
