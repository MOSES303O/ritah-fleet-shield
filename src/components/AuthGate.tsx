import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useSession, hasRole, type Role } from "@/lib/auth";
import Nav from "@/components/Nav";

export default function AuthGate({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const session = useSession();

  if (!session) {
    return (
      <main className="min-h-screen">
        <Nav />
        <div className="pt-32 mx-auto max-w-xl px-6">
          <div className="glass rounded-2xl p-8 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-[var(--neon)]" />
            <h1 className="mt-4 text-2xl font-bold">Sign in required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This area is protected. Sign in with your phone OTP to continue.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-[var(--neon)] text-[var(--primary-foreground)] px-5 py-2 text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!hasRole(session, roles)) {
    return (
      <main className="min-h-screen">
        <Nav />
        <div className="pt-32 mx-auto max-w-xl px-6">
          <div className="glass rounded-2xl p-8 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-[var(--danger)]" />
            <h1 className="mt-4 text-2xl font-bold">Insufficient role</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as <span className="font-mono text-foreground">{session.role}</span>.
              This page requires: <span className="font-mono text-foreground">{roles.join(", ")}</span>.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-full border border-border px-5 py-2 text-sm font-semibold"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
