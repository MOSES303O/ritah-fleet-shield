import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, ShieldCheck, Upload } from "lucide-react";
import Nav from "@/components/Nav";
import AuthGate from "@/components/AuthGate";
import { logout, setSession, useSession } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ritah" },
      { name: "description", content: "Profile, notifications, and KYC documents." },
      { property: "og:title", content: "Settings — Ritah" },
      { property: "og:description", content: "Manage your Ritah account." },
    ],
  }),
  component: () => (
    <AuthGate roles={["owner", "renter", "admin"]}>
      <SettingsPage />
    </AuthGate>
  ),
});

function SettingsPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState(session?.name ?? "");
  const [notify, setNotify] = useState(true);

  const save = () => {
    if (!session) return;
    setSession({ ...session, name });
    toast.success("Profile saved");
  };

  const verify = () => {
    if (!session) return;
    setSession({ ...session, kycVerified: true });
    toast.success("KYC marked verified (mock)");
  };

  const signOut = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-3xl px-6 space-y-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
            Account
          </div>
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold">Profile</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm outline-none"
          />
          <div className="text-xs text-muted-foreground">
            Phone: <span className="font-mono text-foreground">{session?.phone}</span> · Role:{" "}
            <span className="font-mono text-foreground">{session?.role}</span>
          </div>
          <button
            onClick={save}
            className="rounded-full bg-[var(--neon)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Save profile
          </button>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <label className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email & SMS for fines and contracts</span>
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
          </label>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold">KYC documents</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--lime)]" />
              Status:{" "}
              <span
                className={
                  session?.kycVerified
                    ? "text-[var(--lime)] font-mono"
                    : "text-[var(--danger)] font-mono"
                }
              >
                {session?.kycVerified ? "VERIFIED" : "PENDING"}
              </span>
            </span>
            {!session?.kycVerified && (
              <button
                onClick={verify}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-4 py-1.5 text-xs font-mono text-[var(--neon)]"
              >
                <Upload className="h-3 w-3" />
                Upload ID
              </button>
            )}
          </div>
        </section>

        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-5 py-2 text-sm font-mono text-[var(--danger)]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </main>
  );
}
