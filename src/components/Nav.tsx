import { useState } from "react";
import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Menu, Shield, X } from "lucide-react";
import { logout, useSession, type Role } from "@/lib/auth";

type NavItem = { to: string; label: string };

function getNavItems(role: Role | undefined, signedIn: boolean): NavItem[] {
  if (!signedIn) {
    return [
      { to: "/#why", label: "Why Now" },
      { to: "/#features", label: "How it works" },
    ];
  }
  if (role === "owner") {
    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/fleet", label: "Fleet" },
      { to: "/contracts", label: "Contracts" },
      { to: "/tracker", label: "Tracker" },
      { to: "/settings", label: "Settings" },
    ];
  }
  if (role === "renter") {
    return [
      { to: "/wallet", label: "Wallet" },
      { to: "/user", label: "Hires" },
      { to: "/settings", label: "Settings" },
    ];
  }
  if (role === "admin") {
    return [
      { to: "/admin", label: "Admin" },
      { to: "/settings", label: "Settings" },
    ];
  }
  return [];
}

export default function Nav() {
  const session = useSession();
  const router = useRouter();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const items = getNavItems(session?.role, !!session);
  const showBack = location.pathname !== "/";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="glass rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <button
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-[var(--neon)] transition shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <Shield className="h-6 w-6 text-[var(--neon)]" />
                <span className="absolute inset-0 blur-md bg-[var(--neon)] opacity-40 rounded-full" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight truncate">
                Ritah<span className="text-[var(--neon)]">.</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
            {items.map((item) =>
              item.to.startsWith("/#") ? (
                <a key={item.to} href={item.to} className="hover:text-foreground transition">
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-3 w-3" />
                {session.name.split(" ")[0]}
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-[0_0_20px_rgba(0,217,255,0.45)]"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border text-muted-foreground hover:text-foreground"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-2 glass rounded-2xl px-4 py-4 flex flex-col gap-2 text-sm">
            {items.map((item) =>
              item.to.startsWith("/#") ? (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-muted-foreground hover:text-foreground"
                  activeProps={{ className: "text-foreground py-2" }}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="pt-2 border-t border-border">
              {session ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out ({session.name.split(" ")[0]})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex justify-center rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-semibold"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
