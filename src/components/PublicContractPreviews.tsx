import { FileText } from "lucide-react";
import { formatKes, getPublicContractPreviews, rentalFleet } from "@/lib/rentalFlow";

export default function PublicContractPreviews() {
  const previews = getPublicContractPreviews(6);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 text-xs font-mono uppercase tracking-widest text-[var(--neon)]">
            Live public contract preview
          </div>
          <h2 className="text-4xl font-bold md:text-5xl">Six shuffled hire contracts ready for owner review.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {previews.map((contract) => {
            const car = rentalFleet.find((item) => item.id === contract.carId);
            return (
              <article key={contract.id} className="rounded-2xl border border-border bg-background/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 font-mono text-sm text-[var(--neon)]">
                    <FileText className="h-4 w-4" /> {contract.id}
                  </span>
                  <span className="rounded-full border border-[var(--lime)]/35 bg-[var(--lime)]/10 px-3 py-1 text-[10px] font-mono text-[var(--lime)]">
                    {contract.status}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold">{car?.make} {car?.model}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{car?.reg} · {car?.location} · {formatKes(contract.ratePerDay)}/day</div>
                <div className="mt-3 text-xs text-foreground">Stake {formatKes(contract.stake)} · delegated to renter contact</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}