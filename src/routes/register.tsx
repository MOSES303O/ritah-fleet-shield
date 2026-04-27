import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import Nav from "@/components/Nav";
import { setSession, type Role } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Ritah" },
      { name: "description", content: "Renter and owner onboarding for Ritah Shield." },
      { property: "og:title", content: "Register — Ritah" },
      { property: "og:description", content: "Create a Ritah account in seconds." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("renter");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^(\+?\d{9,15})$/.test(phone)) {
      toast.error("Enter a valid name and phone");
      return;
    }
    setSession({
      phone,
      name,
      role,
      kycVerified: false,
      createdAt: new Date().toISOString(),
    });
    toast.success("Account created — complete KYC in Settings");
    navigate({ to: "/settings" });
  };

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="pt-32 mx-auto max-w-md px-6">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-2 text-[var(--neon)]">
            <UserPlus className="h-5 w-5" />
            <span className="text-xs font-mono uppercase tracking-widest">Onboarding</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">Create account</h1>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm outline-none"
            />
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--lime)] mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["renter", "owner"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={
                      role === r
                        ? "rounded-full border border-[var(--neon)] bg-[var(--neon)]/10 px-3 py-2 text-xs font-mono text-[var(--neon)]"
                        : "rounded-full border border-border px-3 py-2 text-xs font-mono text-muted-foreground"
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full rounded-full bg-[var(--neon)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
              Create account
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--neon)]">
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
