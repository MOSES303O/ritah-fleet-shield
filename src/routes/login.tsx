import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";
import Nav from "@/components/Nav";
import { setSession, type Role } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Ritah" },
      { name: "description", content: "Phone OTP login for Ritah Shield owners, renters, and admins." },
      { property: "og:title", content: "Login — Ritah" },
      { property: "og:description", content: "Sign in with phone OTP." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [role, setRole] = useState<Role>("renter");

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(\+?\d{9,15})$/.test(phone)) {
      toast.error("Enter a valid phone number");
      return;
    }
    setStep("otp");
    toast.success("OTP sent: 123456 (mock)");
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456") {
      toast.error("Invalid OTP. Try 123456.");
      return;
    }
    setSession({
      phone,
      name: role === "owner" ? "Fleet Owner" : role === "admin" ? "Ritah Admin" : "Renter",
      role,
      kycVerified: true,
      createdAt: new Date().toISOString(),
    });
    toast.success(`Signed in as ${role}`);
    navigate({ to: role === "renter" ? "/wallet" : role === "admin" ? "/admin" : "/dashboard" });
  };

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="pt-32 mx-auto max-w-md px-6">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-2 text-[var(--neon)]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-mono uppercase tracking-widest">Phone OTP login</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mock OTP — use code <span className="font-mono text-foreground">123456</span>.
          </p>

          {step === "phone" ? (
            <form onSubmit={sendOtp} className="mt-6 space-y-4">
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--lime)]">
                Phone
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254712345678"
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                />
              </div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--lime)]">
                Sign in as
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["renter", "owner", "admin"] as Role[]).map((r) => (
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
              <button className="w-full rounded-full bg-[var(--neon)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="mt-6 space-y-4">
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--lime)]">
                OTP code
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm outline-none"
              />
              <button className="w-full rounded-full bg-[var(--neon)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
                Verify & continue
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-xs text-muted-foreground"
              >
                ← change phone
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="text-[var(--neon)]">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
