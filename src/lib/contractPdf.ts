import jsPDF from "jspdf";
import type { FleetCar, HireContract, NtsaFine } from "./rentalFlow";
import { formatKes } from "./rentalFlow";

export function downloadContractPdf(contract: HireContract, car: FleetCar | undefined, fines: NtsaFine[] = []) {
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

  line("RITAH HIRE CONTRACT AGREEMENT", 18, true);
  line("Blockchain-delegated NTSA liability shield", 10);
  hr();

  line(`Contract ID: ${contract.id}`, 11, true);
  line(`Created: ${contract.createdAt}    Status: ${contract.status}`);
  y += 6;

  line("1. Vehicle", 13, true);
  line(`Plate: ${car?.reg ?? "—"}`);
  line(`Vehicle: ${car?.make ?? ""} ${car?.model ?? ""}  ·  ${car?.seats ?? "—"} seats`);
  line(`Pickup location: ${car?.location ?? "—"}`);
  line(`Allowed hours: ${car?.allowedHours ?? "—"}`);
  line(`Speed limit: ${car?.speedLimit ?? "—"} km/h`);
  line(`Maximum hire: ${car?.maxHireDays ?? "—"} days`);
  y += 6;

  line("2. Delegated Renter", 13, true);
  line(`Name: ${contract.renter}`);
  line(`Phone: ${contract.renterPhone}`);
  line(`Email: ${contract.renterEmail}`);
  line(`Liability is delegated to the renter contact above for all NTSA fines incurred during the hire window.`);
  y += 6;

  line("3. Financial Terms", 13, true);
  line(`Daily rate: ${formatKes(contract.ratePerDay)}`);
  line(`Locked stake: ${formatKes(contract.stake)}`);
  line(`Wallet minimum required: ${formatKes(car?.requiresWalletMinimum ?? 0)}`);
  y += 6;

  line("4. NTSA Fine Settlement", 13, true);
  if (fines.length === 0) {
    line("No fines recorded against this contract.");
  } else {
    fines.forEach((f) => {
      line(`• ${f.createdAt} — ${f.reason} (${f.speed}/${f.limit} km/h) — ${formatKes(f.amount)} — ${f.status}`);
    });
    const total = fines.reduce((s, f) => s + f.amount, 0);
    y += 4;
    line(`Total fines: ${formatKes(total)}`, 11, true);
  }
  y += 10;

  line("5. Acknowledgement", 13, true);
  line(
    "By signing below, the renter accepts liability delegation, authorises stake locking on the Ritah smart contract, and consents to automatic NTSA fine deductions from the wallet balance.",
  );
  y += 24;
  line("Renter signature: ____________________________", 11);
  y += 8;
  line(`Date: ${new Date().toLocaleDateString("en-KE")}`, 11);

  doc.save(`ritah-contract-${contract.id}.pdf`);
}
