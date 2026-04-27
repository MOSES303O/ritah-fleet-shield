import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import FineLedgerPanel from "@/components/FineLedgerPanel";
import ClientOnly from "@/components/ClientOnly";
import ContractTimeline from "@/components/ContractTimeline";
import { getSignups, clearSignups, type Signup } from "@/lib/signups";
import {
  seedFleet,
  tickFleet,
  maybeGenerateViolation,
  type Vehicle,
  type Violation,
} from "@/lib/mockFleet";
import { Users, Car, AlertTriangle, Wallet, Trash2, CheckCircle2, Plus, FileText, Pencil, X, Upload, Zap, Download, Layers, ShieldAlert } from "lucide-react";
import { formatKes, mockFineLedger, mockHireBundles, mockHireContracts, ntsaFineCatalog, rentalFleet, type FleetCar, type FleetHireBundle, type HireContract, type NtsaFine } from "@/lib/rentalFlow";
import { downloadContractPdf } from "@/lib/contractPdf";
import { downloadBundlePdf } from "@/lib/bundlePdf";
import BundleTimeline from "@/components/BundleTimeline";
import { toast } from "sonner";
import {
  appendEvent,
  getDisputes,
  nowLabel,
  saveDisputes,
  subscribeDisputes,
  type BundleDispute,
} from "@/lib/bundleDisputes";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — Ritah" },
      {
        name: "description",
        content:
          "Ritah admin dashboard: pilot signups, fleet overview, NTSA violation log, and escrow monitoring.",
      },
      { property: "og:title", content: "Admin Control Center — Ritah" },
      {
        property: "og:description",
        content:
          "Operations cockpit for Ritah pilot fleets — signups, escrow, and live violation settlements.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [fleet, setFleet] = useState<Vehicle[]>(() => seedFleet());
  const [violations, setViolations] = useState<Violation[]>([]);
  const [ownerContracts, setOwnerContracts] = useState<HireContract[]>(mockHireContracts);
  const [ownerBundles, setOwnerBundles] = useState<FleetHireBundle[]>(mockHireBundles);
  const [inventory, setInventory] = useState<FleetCar[]>(rentalFleet);
  const [editingCar, setEditingCar] = useState<FleetCar | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("reg,make,model,seats,location,ratePerDay,stake\nKBX 100A,Toyota,Vitz,5,Lavington,3500,7000");
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const [adminFines, setAdminFines] = useState<NtsaFine[]>(mockFineLedger);
  const [walletPool, setWalletPool] = useState(50000);
  const [createForm, setCreateForm] = useState({ carId: rentalFleet[0]?.id ?? "", renter: "", phone: "", email: "" });
  const [bundleDisputes, setBundleDisputes] = useState<Record<string, BundleDispute>>({});
  const [disputeDraft, setDisputeDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const sync = () => setBundleDisputes(getDisputes());
    sync();
    return subscribeDisputes(sync);
  }, []);

  const persistDisputes = (next: Record<string, BundleDispute>) => {
    setBundleDisputes(next);
    saveDisputes(next);
  };

  const blankCar = (): FleetCar => ({
    id: `car-${Date.now()}`,
    reg: "",
    make: "",
    model: "",
    seats: 5,
    location: "Nairobi",
    ratePerDay: 4000,
    stake: 7500,
    speedLimit: 80,
    allowedHours: "06:00–22:00",
    maxHireDays: 7,
    requiresWalletMinimum: 8000,
    available: true,
    ownerListed: true,
  });

  const upsertCar = (car: FleetCar) => {
    setInventory((prev) => {
      const exists = prev.some((c) => c.id === car.id);
      return exists ? prev.map((c) => (c.id === car.id ? car : c)) : [car, ...prev];
    });
    setEditingCar(null);
  };

  const removeCar = (id: string) => setInventory((prev) => prev.filter((c) => c.id !== id));
  const toggleListed = (id: string) =>
    setInventory((prev) => prev.map((c) => (c.id === id ? { ...c, ownerListed: !c.ownerListed } : c)));

  useEffect(() => {
    const refresh = () => setSignups(getSignups());
    refresh();
    window.addEventListener("ritah:signups-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ritah:signups-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFleet((prev) => {
        const next = tickFleet(prev);
        const v = maybeGenerateViolation(next);
        if (v) setViolations((vs) => [v, ...vs].slice(0, 50));
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalEscrow = fleet.reduce((s, v) => s + v.stake, 0);
  const settled = violations.filter((v) => v.status === "AUTO-SETTLED");
  const totalSettled = settled.reduce((s, v) => s + v.amount, 0);
  const ownerFineTotal = adminFines.reduce((sum, fine) => sum + fine.amount, 0);
  const requestedContracts = ownerContracts.filter((contract) => contract.status === "REQUESTED");

  const approveContract = (id: string) => {
    setOwnerContracts((prev) => prev.map((contract) => (contract.id === id ? { ...contract, status: "APPROVED" } : contract)));
  };

  // Cars locked by any active/approved/requested contract OR bundle (conflict prevention)
  const lockedCarIds = (() => {
    const fromContracts = ownerContracts
      .filter((c) => c.status === "REQUESTED" || c.status === "APPROVED" || c.status === "ACTIVE")
      .map((c) => c.carId);
    const fromBundles = ownerBundles
      .filter((b) => b.status === "REQUESTED" || b.status === "APPROVED" || b.status === "ACTIVE")
      .flatMap((b) => b.carIds);
    return new Set([...fromContracts, ...fromBundles]);
  })();

  const advanceBundle = (id: string, next: FleetHireBundle["status"]) => {
    setOwnerBundles((prev) => prev.map((b) => (b.id === id ? { ...b, status: next } : b)));
    const labels: Record<FleetHireBundle["status"], string> = {
      REQUESTED: "Bundle reset to requested",
      APPROVED: "Bundle approved",
      ACTIVE: "Bundle active · stake locked",
      CLOSED: "Bundle closed · stake released",
    };
    toast.success(labels[next], { description: `Bundle ${id}` });
  };

  const rejectBundle = (id: string) => {
    setOwnerBundles((prev) => prev.filter((b) => b.id !== id));
    toast.error("Bundle rejected", { description: `Bundle ${id} removed from queue.` });
  };

  const fileBundleDispute = (id: string) => {
    const reason = (disputeDraft[id] ?? "").trim();
    if (!reason) {
      toast.warning("Add a dispute reason before filing.");
      return;
    }
    setBundleDisputes((prev) => ({
      ...prev,
      [id]: { reason, overrideApproved: false, createdAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) },
    }));
    setDisputeDraft((prev) => ({ ...prev, [id]: "" }));
    toast.info("Dispute filed", { description: "Renter notified · awaiting override decision." });
  };

  const overrideBundleDispute = (id: string) => {
    setBundleDisputes((prev) => prev[id] ? { ...prev, [id]: { ...prev[id], overrideApproved: true } } : prev);
    toast.success("Conflict override authorised", { description: "You can now approve this bundle." });
  };

  const clearBundleDispute = (id: string) => {
    setBundleDisputes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast("Dispute cleared.");
  };

  const createAdminContract = () => {
    const car = rentalFleet.find((item) => item.id === createForm.carId) ?? rentalFleet[0];
    if (!car || !createForm.renter.trim() || !createForm.phone.trim() || !createForm.email.trim()) return;
    const contract: HireContract = {
      id: `contract-admin-${Date.now()}`,
      carId: car.id,
      renter: createForm.renter,
      renterEmail: createForm.email,
      renterPhone: createForm.phone,
      delegatedTo: `${createForm.phone} · ${createForm.email}`,
      stake: car.stake,
      ratePerDay: car.ratePerDay,
      status: "APPROVED",
      createdAt: "Admin now",
    };
    setOwnerContracts((prev) => [contract, ...prev]);
    setCreateForm({ carId: car.id, renter: "", phone: "", email: "" });
  };

  const bulkImport = () => {
    setBulkMsg(null);
    const lines = bulkText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return setBulkMsg("Provide a header row and at least one data row.");
    const headers = lines[0].split(",").map((h) => h.trim());
    const required = ["reg", "make", "model", "seats", "location", "ratePerDay", "stake"];
    if (!required.every((r) => headers.includes(r))) return setBulkMsg(`Missing columns. Required: ${required.join(", ")}`);
    let added = 0;
    const newCars: FleetCar[] = [];
    for (const row of lines.slice(1)) {
      const cells = row.split(",").map((c) => c.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => (obj[h] = cells[i] ?? ""));
      if (!obj.reg || !obj.make) continue;
      const stake = Math.max(5000, Math.min(10000, Number(obj.stake) || 7000));
      newCars.push({
        id: `car-imp-${Date.now()}-${added}`,
        reg: obj.reg.toUpperCase(),
        make: obj.make,
        model: obj.model,
        seats: Number(obj.seats) || 5,
        location: obj.location || "Nairobi",
        ratePerDay: Number(obj.ratePerDay) || 4000,
        stake,
        speedLimit: 80,
        allowedHours: "06:00–22:00",
        maxHireDays: 7,
        requiresWalletMinimum: stake + 1000,
        available: true,
        ownerListed: true,
      });
      added++;
    }
    if (!added) return setBulkMsg("No valid rows found.");
    setInventory((prev) => [...newCars, ...prev]);
    setBulkMsg(`Imported ${added} vehicle${added === 1 ? "" : "s"}.`);
  };

  const settleFineFor = (contract: HireContract) => {
    const car = rentalFleet.find((c) => c.id === contract.carId);
    if (!car) return;
    const cat = ntsaFineCatalog[Math.floor(Math.random() * ntsaFineCatalog.length)];
    const canDeduct = walletPool >= cat.amount;
    const fine: NtsaFine = {
      id: `fine-sim-${Date.now()}`,
      contractId: contract.id,
      reg: car.reg,
      reason: cat.reason,
      speed: Math.max(cat.speed, car.speedLimit + 10),
      limit: car.speedLimit,
      amount: cat.amount,
      status: canDeduct ? "AUTO-DEDUCTED" : "INSUFFICIENT WALLET",
      createdAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
    };
    setAdminFines((prev) => [fine, ...prev]);
    if (canDeduct) setWalletPool((prev) => prev - cat.amount);
  };

  return (
    <main className="min-h-screen pb-24">
      <Nav />
      <div className="pt-32 mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)] mb-2">
            Admin · Control center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Operations <span className="text-gradient-neon">Cockpit</span>
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Kpi
            icon={<Users className="h-4 w-4" />}
            label="Pilot Signups"
            value={signups.length.toString()}
            tone="neon"
          />
          <Kpi
            icon={<Car className="h-4 w-4" />}
            label="Active Vehicles"
            value={fleet.length.toString()}
            tone="lime"
          />
          <Kpi
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Violations (session)"
            value={violations.length.toString()}
            tone="danger"
          />
          <Kpi
            icon={<Wallet className="h-4 w-4" />}
            label="Escrow Liquidity"
            value={`KES ${totalEscrow.toLocaleString()}`}
            tone="lime"
          />
        </div>

        <section className="mb-5 glass rounded-2xl p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold"><FileText className="mr-2 inline h-4 w-4 text-[var(--neon)]" />Admin-only hire contracts</h2>
              <p className="mt-1 text-xs text-muted-foreground">Owner creates contracts and approves renter requests tied to phone and email delegation.</p>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">Wallet pool: <span className="text-[var(--lime)]">{formatKes(walletPool)}</span></div>
          </div>

          {/* Hire contract creation form */}
          <div className="mb-4 grid gap-2 rounded-xl border border-[var(--neon)]/30 bg-[var(--neon)]/5 p-4 text-xs sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <label className="flex flex-col gap-1"><span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Vehicle</span>
              <select value={createForm.carId} onChange={(e) => setCreateForm({ ...createForm, carId: e.target.value })} className="rounded-md border border-border bg-background/50 px-2 py-1.5">
                {rentalFleet.map((c) => <option key={c.id} value={c.id}>{c.reg} · {c.make} {c.model}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1"><span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Renter name</span>
              <input value={createForm.renter} onChange={(e) => setCreateForm({ ...createForm, renter: e.target.value })} className="rounded-md border border-border bg-background/50 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1"><span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Phone</span>
              <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="rounded-md border border-border bg-background/50 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1"><span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Email</span>
              <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="rounded-md border border-border bg-background/50 px-2 py-1.5" />
            </label>
            <button onClick={createAdminContract} className="self-end rounded-lg bg-[var(--neon)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)]"><Plus className="mr-1 inline h-4 w-4" />Create</button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {ownerContracts.map((contract) => {
              const car = rentalFleet.find((item) => item.id === contract.carId);
              const fines = adminFines.filter((f) => f.contractId === contract.id);
              return (
                <div key={contract.id} className="rounded-xl border border-border bg-background/30 p-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="font-mono text-[var(--neon)]">{contract.id}</div><div className="mt-1 font-semibold">{car?.reg} · {car?.make} {car?.model}</div></div>
                    <span className={contract.status === "REQUESTED" ? "text-[var(--danger)]" : "text-[var(--lime)]"}>{contract.status}</span>
                  </div>
                  <div className="mt-2 text-muted-foreground" suppressHydrationWarning>{contract.renter} · {contract.renterPhone} · {contract.renterEmail}</div>
                  <div className="mt-2 text-foreground">Stake {formatKes(contract.stake)} · Rate {formatKes(contract.ratePerDay)}/day · Fines {formatKes(fines.reduce((s, f) => s + f.amount, 0))}</div>
                  <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <ContractTimeline status={contract.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contract.status === "REQUESTED" && <button onClick={() => approveContract(contract.id)} className="rounded-lg border border-[var(--lime)]/40 bg-[var(--lime)]/10 px-3 py-2 text-[11px] font-bold text-[var(--lime)]"><CheckCircle2 className="mr-1 inline h-4 w-4" />Approve</button>}
                    <button onClick={() => settleFineFor(contract)} className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-[11px] font-bold text-[var(--danger)]"><Zap className="mr-1 inline h-4 w-4" />Simulate NTSA fine</button>
                    <button onClick={() => downloadContractPdf(contract, car, fines)} className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold hover:border-[var(--neon)]/50"><Download className="mr-1 inline h-4 w-4" />Agreement PDF</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Pending owner approvals: <span className="text-foreground">{requestedContracts.length}</span></div>
        </section>

        {/* Bundle approval flow */}
        <section className="mb-5 glass rounded-2xl p-5 border border-[var(--neon)]/30">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold"><Layers className="mr-2 inline h-4 w-4 text-[var(--neon)]" />Fleet bundle approvals</h2>
              <p className="mt-1 text-xs text-muted-foreground">Approve or reject multi-car bundle requests. Conflicts with existing contracts are flagged before approval.</p>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">Pending bundles: <span className="text-foreground">{ownerBundles.filter((b) => b.status === "REQUESTED").length}</span></div>
          </div>

          {ownerBundles.length === 0 && <div className="text-xs text-muted-foreground">No bundle requests yet.</div>}

          <div className="grid gap-3 lg:grid-cols-2">
            {ownerBundles.map((b) => {
              // Conflict scan: any car in this bundle that is locked by ANOTHER contract/bundle
              const conflicts = b.carIds.filter((id) => {
                const otherContract = ownerContracts.some((c) => c.carId === id && (c.status === "APPROVED" || c.status === "ACTIVE"));
                const otherBundle = ownerBundles.some((other) => other.id !== b.id && other.carIds.includes(id) && (other.status === "APPROVED" || other.status === "ACTIVE"));
                return otherContract || otherBundle;
              });
              const conflictRegs = conflicts.map((id) => rentalFleet.find((c) => c.id === id)?.reg ?? id);
              const dispute = bundleDisputes[b.id];
              const canApprove = b.status === "REQUESTED" && (conflicts.length === 0 || dispute?.overrideApproved);

              return (
                <div key={b.id} className="rounded-xl border border-border bg-background/30 p-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[var(--neon)]">{b.id}</div>
                      <div className="mt-1 font-semibold">{b.carIds.length} cars · {b.days} days</div>
                    </div>
                    <span className={
                      b.status === "REQUESTED" ? "text-[var(--danger)]" :
                      b.status === "CLOSED" ? "text-muted-foreground" : "text-[var(--lime)]"
                    }>{b.status}</span>
                  </div>
                  <div className="mt-2 text-muted-foreground" suppressHydrationWarning>{b.renter} · {b.renterPhone} · {b.renterEmail}</div>
                  <div className="mt-2 text-foreground">Total stake {formatKes(b.totalStake)} · Per-car {formatKes(b.perCarStake)}</div>
                  <div className="mt-1 text-muted-foreground">
                    {b.carIds.map((id) => {
                      const reg = rentalFleet.find((c) => c.id === id)?.reg ?? id;
                      const inConflict = conflicts.includes(id);
                      return <span key={id} className={inConflict ? "text-[var(--danger)] mr-2" : "mr-2"}>{reg}{inConflict ? "⚠" : ""}</span>;
                    })}
                  </div>

                  {conflicts.length > 0 && (
                    <div className="mt-2 space-y-2 rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-2 text-[11px] text-[var(--danger)]">
                      <div><AlertTriangle className="mr-1 inline h-3 w-3" />Conflict: {conflictRegs.join(", ")} already locked elsewhere.</div>
                      {!dispute && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            value={disputeDraft[b.id] ?? ""}
                            onChange={(e) => setDisputeDraft((prev) => ({ ...prev, [b.id]: e.target.value }))}
                            placeholder="Dispute reason (e.g. prior contract cancelled)"
                            className="flex-1 rounded-md border border-[var(--danger)]/40 bg-background/50 px-2 py-1 text-foreground placeholder:text-muted-foreground"
                          />
                          <button onClick={() => fileBundleDispute(b.id)} className="rounded-md border border-[var(--danger)]/60 bg-[var(--danger)]/20 px-3 py-1 font-bold">
                            <ShieldAlert className="mr-1 inline h-3 w-3" />File dispute
                          </button>
                        </div>
                      )}
                      {dispute && (
                        <div className="rounded-md border border-[var(--danger)]/30 bg-background/30 p-2 text-foreground">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--danger)]">Dispute · {dispute.createdAt}</div>
                          <div className="mt-1 text-[11px]">{dispute.reason}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {!dispute.overrideApproved ? (
                              <button onClick={() => overrideBundleDispute(b.id)} className="rounded-md border border-[var(--lime)]/50 bg-[var(--lime)]/10 px-2 py-1 text-[11px] font-bold text-[var(--lime)]">
                                <CheckCircle2 className="mr-1 inline h-3 w-3" />Authorise override
                              </button>
                            ) : (
                              <span className="text-[11px] text-[var(--lime)]">Override authorised — approval unlocked.</span>
                            )}
                            <button onClick={() => clearBundleDispute(b.id)} className="rounded-md border border-border px-2 py-1 text-[11px]">Clear dispute</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <BundleTimeline status={b.status} carCount={b.carIds.length} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.status === "REQUESTED" && (
                      <>
                        <button
                          onClick={() => advanceBundle(b.id, "APPROVED")}
                          disabled={!canApprove}
                          className="rounded-lg border border-[var(--lime)]/40 bg-[var(--lime)]/10 px-3 py-2 text-[11px] font-bold text-[var(--lime)] disabled:opacity-40"
                        >
                          <CheckCircle2 className="mr-1 inline h-4 w-4" />Approve bundle
                        </button>
                        <button onClick={() => rejectBundle(b.id)} className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-[11px] font-bold text-[var(--danger)]">
                          <X className="mr-1 inline h-4 w-4" />Reject
                        </button>
                      </>
                    )}
                    {b.status === "APPROVED" && (
                      <button onClick={() => advanceBundle(b.id, "ACTIVE")} className="rounded-lg border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-3 py-2 text-[11px] font-bold text-[var(--neon)]">
                        <Zap className="mr-1 inline h-4 w-4" />Lock stake · activate
                      </button>
                    )}
                    {b.status === "ACTIVE" && (
                      <button onClick={() => advanceBundle(b.id, "CLOSED")} className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold hover:border-[var(--lime)]/50">
                        Close bundle
                      </button>
                    )}
                    <button onClick={() => downloadBundlePdf(b, rentalFleet)} className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold hover:border-[var(--neon)]/50">
                      <Download className="mr-1 inline h-4 w-4" />Bundle PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-[11px] text-muted-foreground">
            Locked cars across all contracts/bundles: <span className="text-foreground">{lockedCarIds.size}</span>
          </div>
        </section>

        <section className="mb-5 glass rounded-2xl p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold"><Car className="mr-2 inline h-4 w-4 text-[var(--lime)]" />Admin car inventory</h2>
              <p className="mt-1 text-xs text-muted-foreground">Add, edit, list/unlist, or remove fleet vehicles. Listed vehicles surface in the public rental workflow.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBulkOpen((v) => !v)} className="rounded-lg border border-[var(--neon)]/40 bg-[var(--neon)]/10 px-4 py-2 text-xs font-bold text-[var(--neon)]"><Upload className="mr-1 inline h-4 w-4" />Bulk import</button>
              <button onClick={() => setEditingCar(blankCar())} className="rounded-lg bg-[var(--lime)] px-4 py-2 text-xs font-bold text-[var(--accent-foreground)]"><Plus className="mr-1 inline h-4 w-4" />Add vehicle</button>
            </div>
          </div>

          {bulkOpen && (
            <div className="mb-4 rounded-xl border border-[var(--neon)]/40 bg-[var(--neon)]/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-widest text-[var(--neon)]">CSV bulk import</div>
                <button onClick={() => setBulkOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="mb-2 text-[11px] text-muted-foreground">Headers required: reg, make, model, seats, location, ratePerDay, stake.</p>
              <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={6} className="w-full rounded-md border border-border bg-background/50 p-2 font-mono text-[11px] text-foreground" />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button onClick={bulkImport} className="rounded-lg bg-[var(--neon)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)]">Import rows</button>
                {bulkMsg && <span className="text-xs text-[var(--lime)]">{bulkMsg}</span>}
              </div>
            </div>
          )}

          {editingCar && (
            <div className="mb-4 rounded-xl border border-[var(--lime)]/40 bg-[var(--lime)]/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-widest text-[var(--lime)]">{inventory.some((c) => c.id === editingCar.id) ? "Edit vehicle" : "New vehicle"}</div>
                <button onClick={() => setEditingCar(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {([
                  ["reg", "Plate"],
                  ["make", "Make"],
                  ["model", "Model"],
                  ["location", "Location"],
                  ["allowedHours", "Allowed hours"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
                    <input
                      value={editingCar[key] as string}
                      onChange={(e) => setEditingCar({ ...editingCar, [key]: e.target.value })}
                      className="rounded-md border border-border bg-background/50 px-2 py-1.5 text-foreground"
                    />
                  </label>
                ))}
                {([
                  ["seats", "Seats"],
                  ["ratePerDay", "Rate / day"],
                  ["stake", "Stake (5000–10000)"],
                  ["speedLimit", "Speed limit"],
                  ["maxHireDays", "Max hire days"],
                  ["requiresWalletMinimum", "Wallet minimum"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
                    <input
                      type="number"
                      value={editingCar[key] as number}
                      onChange={(e) => setEditingCar({ ...editingCar, [key]: Number(e.target.value) })}
                      className="rounded-md border border-border bg-background/50 px-2 py-1.5 text-foreground"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editingCar.ownerListed} onChange={(e) => setEditingCar({ ...editingCar, ownerListed: e.target.checked })} />Listed publicly</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={editingCar.available} onChange={(e) => setEditingCar({ ...editingCar, available: e.target.checked })} />Available now</label>
                <button
                  onClick={() => {
                    const stake = Math.max(5000, Math.min(10000, editingCar.stake));
                    if (!editingCar.reg.trim() || !editingCar.make.trim()) return;
                    upsertCar({ ...editingCar, stake });
                  }}
                  className="ml-auto rounded-lg bg-[var(--neon)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)]"
                >
                  Save vehicle
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <tr className="text-left">
                  <th className="py-2 pr-3">Plate</th>
                  <th className="py-2 pr-3">Vehicle</th>
                  <th className="py-2 pr-3">Location</th>
                  <th className="py-2 pr-3 text-right">Rate</th>
                  <th className="py-2 pr-3 text-right">Stake</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((car) => (
                  <tr key={car.id} className="border-t border-white/5">
                    <td className="py-2 pr-3 font-mono text-[var(--neon)]">{car.reg}</td>
                    <td className="py-2 pr-3">{car.make} {car.model} · {car.seats} seats</td>
                    <td className="py-2 pr-3 text-muted-foreground">{car.location}</td>
                    <td className="py-2 pr-3 text-right">{formatKes(car.ratePerDay)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--lime)]">{formatKes(car.stake)}</td>
                    <td className="py-2 pr-3">
                      <span className={car.ownerListed ? "text-[var(--lime)]" : "text-muted-foreground"}>{car.ownerListed ? "LISTED" : "HIDDEN"}</span>
                      {" · "}
                      <span className={car.available ? "text-foreground" : "text-[var(--danger)]"}>{car.available ? "FREE" : "HIRED"}</span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => toggleListed(car.id)} className="rounded border border-border px-2 py-1 text-[10px] hover:border-[var(--lime)]/50">{car.ownerListed ? "Unlist" : "List"}</button>
                        <button onClick={() => setEditingCar(car)} className="rounded border border-border px-2 py-1 text-[10px] hover:border-[var(--neon)]/50"><Pencil className="inline h-3 w-3" /></button>
                        <button onClick={() => removeCar(car.id)} className="rounded border border-border px-2 py-1 text-[10px] hover:border-[var(--danger)]/50"><Trash2 className="inline h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No vehicles in inventory.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Signups */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--neon)]" />
                <span className="text-sm font-semibold">Pilot Signups</span>
              </div>
              {signups.length > 0 && (
                <button
                  onClick={() => {
                    clearSignups();
                    setSignups([]);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-[var(--danger)] transition"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <ClientOnly fallback={<div className="text-xs font-mono text-muted-foreground py-8 text-center">Loading signups…</div>}>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {signups.length === 0 && (
                  <div className="text-xs font-mono text-muted-foreground py-8 text-center">
                    No signups yet. Submit the form on the home page.
                  </div>
                )}
                {signups.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md bg-black/30 px-3 py-2 border border-white/5 text-xs font-mono"
                  >
                    <span>{s.email}</span>
                    <span className="text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ClientOnly>
          </div>

          {/* Fleet table */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-4 w-4 text-[var(--lime)]" />
              <span className="text-sm font-semibold">Active Delegations</span>
            </div>
            <div className="space-y-1.5">
              {fleet.map((v) => (
                <div
                  key={v.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-black/30 px-3 py-2 border border-white/5 text-xs font-mono"
                >
                  <div>
                    <div className="text-foreground">{v.reg}</div>
                    <div className="text-muted-foreground text-[10px]">{v.driver}</div>
                  </div>
                  <span
                    style={{
                      color:
                        v.status === "VIOLATION"
                          ? "var(--danger)"
                          : v.status === "WARN"
                          ? "var(--lime)"
                          : "var(--neon)",
                    }}
                  >
                    {v.speed} km/h
                  </span>
                  <span className="text-[var(--lime)]">
                    KES {v.stake.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Violation ledger */}
        <div className="mt-5 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
              <span className="text-sm font-semibold">Blockchain Ledger · Settlements</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--lime)]">
              Σ KES {totalSettled.toLocaleString()} settled
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="py-2 pr-4">TIME</th>
                  <th className="py-2 pr-4">REG</th>
                  <th className="py-2 pr-4">DRIVER</th>
                  <th className="py-2 pr-4">VIOLATION</th>
                  <th className="py-2 pr-4 text-right">AMOUNT</th>
                  <th className="py-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {violations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Listening for NTSA events…
                    </td>
                  </tr>
                )}
                {violations.map((v) => (
                  <tr key={v.id} className="border-t border-white/5">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(v.ts).toLocaleTimeString()}
                    </td>
                    <td className="py-2 pr-4">{v.reg}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{v.driver}</td>
                    <td className="py-2 pr-4 text-[var(--danger)]">{v.type}</td>
                    <td className="py-2 pr-4 text-right text-[var(--lime)]">
                      KES {v.amount.toLocaleString()}
                    </td>
                    <td
                      className="py-2 text-right"
                      style={{
                        color:
                          v.status === "AUTO-SETTLED"
                            ? "var(--lime)"
                            : "var(--neon)",
                      }}
                    >
                      {v.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-5">
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold"><Car className="inline h-4 w-4 mr-2 text-[var(--neon)]" />Owner hire contracts</h2>
              <span className="text-[11px] font-mono text-[var(--lime)]">ADMIN / OWNER REVIEW</span>
            </div>
            <div className="space-y-2">
              {ownerContracts.map((contract) => {
                const car = rentalFleet.find((item) => item.id === contract.carId);
                return <div key={contract.id} className="rounded-lg border border-border bg-background/30 p-3 text-xs"><div className="flex justify-between gap-3"><span className="font-mono text-[var(--neon)]">{car?.reg}</span><span className={contract.status === "ACTIVE" ? "text-[var(--lime)]" : "text-muted-foreground"}>{contract.status}</span></div><div className="mt-1 text-muted-foreground" suppressHydrationWarning>{contract.renter} · {contract.delegatedTo}</div><div className="mt-1 text-foreground">Stake {formatKes(contract.stake)} · Rate {formatKes(contract.ratePerDay)}/day</div></div>;
              })}
            </div>
          </section>

          <FineLedgerPanel title={`Owner fine ledger · Σ ${formatKes(ownerFineTotal)}`} fines={adminFines} />
        </div>
      </div>
    </main>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "neon" | "lime" | "danger";
}) {
  const color =
    tone === "neon"
      ? "var(--neon)"
      : tone === "lime"
      ? "var(--lime)"
      : "var(--danger)";
  return (
    <div className="glass rounded-2xl p-5">
      <div
        className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"
        style={{ color }}
      >
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-display font-bold">{value}</div>
    </div>
  );
}
