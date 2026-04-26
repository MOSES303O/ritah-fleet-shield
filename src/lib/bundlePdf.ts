import jsPDF from "jspdf";
import type { FleetCar, FleetHireBundle } from "./rentalFlow";
import { formatKes } from "./rentalFlow";

export function downloadBundlePdf(bundle: FleetHireBundle, cars: FleetCar[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const line = (text: string, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const split = doc.splitTextToSize(text, 515);
    doc.text(split, margin, y);
    y += split.length * (size + 4);
  };
  const hr = () => {
    doc.setDrawColor(160);
    doc.line(margin, y, 595 - margin, y);
    y += 14;
  };

  line("RITAH FLEET BUNDLE HIRE AGREEMENT", 18, true);
  line("Single stake · multi-vehicle delegation", 10);
  hr();

  line(`Bundle ID: ${bundle.id}`, 11, true);
  line(`Created: ${bundle.createdAt}    Status: ${bundle.status}`);
  y += 6;

  line("1. Delegated Renter", 13, true);
  line(`Name: ${bundle.renter}`);
  line(`Phone: ${bundle.renterPhone}`);
  line(`Email: ${bundle.renterEmail}`);
  y += 6;

  line(`2. Vehicles in Bundle (${bundle.carIds.length})`, 13, true);
  bundle.carIds.forEach((id, idx) => {
    const car = cars.find((c) => c.id === id);
    line(`${idx + 1}. ${car?.reg ?? id} — ${car?.make ?? ""} ${car?.model ?? ""} · ${car?.location ?? ""} · ${formatKes(car?.ratePerDay ?? 0)}/day`);
  });
  y += 6;

  line("3. Combined Financial Terms", 13, true);
  line(`Total locked stake: ${formatKes(bundle.totalStake)}`);
  line(`Per-car stake share: ${formatKes(bundle.perCarStake)}`);
  line(`Hire window: ${bundle.days} days`);
  y += 6;

  line("4. Acknowledgement", 13, true);
  line(
    "Renter accepts liability delegation across all listed vehicles, authorises a single combined stake lock on the Ritah smart contract, and consents to NTSA fine deductions for any vehicle in this bundle.",
  );
  y += 24;
  line("Renter signature: ____________________________", 11);
  y += 8;
  line(`Date: ${new Date().toLocaleDateString("en-KE")}`, 11);

  doc.save(`ritah-bundle-${bundle.id}.pdf`);
}
