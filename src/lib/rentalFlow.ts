export type FleetCar = {
  id: string;
  reg: string;
  make: string;
  model: string;
  seats: number;
  location: string;
  ratePerDay: number;
  stake: number;
  speedLimit: number;
  allowedHours: string;
  maxHireDays: number;
  requiresWalletMinimum: number;
  available: boolean;
  ownerListed: boolean;
};

export type Wallet = {
  holder: string;
  balance: number;
  verified: boolean;
};

export type HireContract = {
  id: string;
  carId: string;
  renter: string;
  renterEmail: string;
  renterPhone: string;
  delegatedTo: string;
  stake: number;
  ratePerDay: number;
  status: "REQUESTED" | "APPROVED" | "ACTIVE" | "CLOSED";
  createdAt: string;
};

export type NtsaFine = {
  id: string;
  contractId: string;
  reg: string;
  reason: string;
  speed: number;
  limit: number;
  amount: number;
  status: "AUTO-DEDUCTED" | "INSUFFICIENT WALLET";
  createdAt: string;
};

export type WalletLedger = {
  id: string;
  type: "LOAD" | "WITHDRAW" | "STAKE LOCK" | "NTSA FINE";
  amount: number;
  note: string;
  createdAt: string;
};

export type FleetHireBundle = {
  id: string;
  renter: string;
  renterEmail: string;
  renterPhone: string;
  carIds: string[];
  totalStake: number;
  perCarStake: number;
  days: number;
  status: "REQUESTED" | "APPROVED" | "ACTIVE" | "CLOSED";
  createdAt: string;
};

export type AvailabilityRule = {
  id: string;
  carId: string;
  label: string;
  detail: string;
  pass: boolean;
};

export const STAKE_MIN = 5000;
export const STAKE_MAX = 10000;

export const ownerProfile = {
  company: "Nairobi Fleet Co.",
  email: "owner@nairobifleet.co.ke",
  verified: true,
};

export const customerWallet: Wallet = {
  holder: "Amina W.",
  balance: 12500,
  verified: true,
};

export const renterIdentity = {
  name: customerWallet.holder,
  email: "amina.wanjiku@example.co.ke",
  phone: "+254 712 448 920",
  loggedIn: true,
};

export const rentalFleet: FleetCar[] = [
  {
    id: "car-1",
    reg: "KDM 421X",
    make: "Toyota",
    model: "Axio",
    seats: 5,
    location: "Westlands",
    ratePerDay: 4200,
    stake: 8500,
    speedLimit: 80,
    allowedHours: "06:00–22:00",
    maxHireDays: 14,
    requiresWalletMinimum: 9000,
    available: true,
    ownerListed: true,
  },
  {
    id: "car-2",
    reg: "KCY 882P",
    make: "Mazda",
    model: "Demio",
    seats: 5,
    location: "Kilimani",
    ratePerDay: 3600,
    stake: 7000,
    speedLimit: 70,
    allowedHours: "05:30–21:30",
    maxHireDays: 10,
    requiresWalletMinimum: 7500,
    available: true,
    ownerListed: true,
  },
  {
    id: "car-3",
    reg: "KDA 119H",
    make: "Nissan",
    model: "X-Trail",
    seats: 7,
    location: "Karen",
    ratePerDay: 6800,
    stake: 10000,
    speedLimit: 80,
    allowedHours: "07:00–20:00",
    maxHireDays: 7,
    requiresWalletMinimum: 12000,
    available: true,
    ownerListed: false,
  },
  {
    id: "car-4",
    reg: "KDC 555Q",
    make: "Subaru",
    model: "Impreza",
    seats: 5,
    location: "Upper Hill",
    ratePerDay: 5200,
    stake: 9000,
    speedLimit: 90,
    allowedHours: "06:00–19:00",
    maxHireDays: 5,
    requiresWalletMinimum: 11000,
    available: false,
    ownerListed: true,
  },
];

export const ntsaFineCatalog = [
  { reason: "SPEED 92/80", amount: 3000, speed: 92 },
  { reason: "RED LIGHT CAMERA", amount: 5000, speed: 74 },
  { reason: "PHONE USE", amount: 2000, speed: 62 },
  { reason: "LANE DISCIPLINE", amount: 1500, speed: 68 },
];

export const mockWalletHistory: WalletLedger[] = [
  { id: "wallet-1", type: "LOAD", amount: 12500, note: "M-Pesa wallet load simulation", createdAt: "09:00" },
  { id: "wallet-2", type: "STAKE LOCK", amount: 8500, note: "KDM 421X hire stake locked", createdAt: "09:12" },
  { id: "wallet-3", type: "NTSA FINE", amount: 3000, note: "Speed fine auto-deducted", createdAt: "10:25" },
  { id: "wallet-4", type: "WITHDRAW", amount: 1000, note: "Unlocked funds withdrawn", createdAt: "11:05" },
];

export const mockFineLedger: NtsaFine[] = [
  { id: "fine-1", contractId: "contract-1", reg: "KDM 421X", reason: "SPEED 92/80", speed: 92, limit: 80, amount: 3000, status: "AUTO-DEDUCTED", createdAt: "10:25" },
  { id: "fine-2", contractId: "contract-1", reg: "KDM 421X", reason: "PHONE USE", speed: 62, limit: 80, amount: 2000, status: "AUTO-DEDUCTED", createdAt: "12:10" },
];

export const mockHireContracts: HireContract[] = [
  { id: "contract-1", carId: "car-1", renter: customerWallet.holder, renterEmail: renterIdentity.email, renterPhone: renterIdentity.phone, delegatedTo: `${renterIdentity.phone} · ${renterIdentity.email}`, stake: 8500, ratePerDay: 4200, status: "ACTIVE", createdAt: "09:12" },
  { id: "contract-2", carId: "car-2", renter: customerWallet.holder, renterEmail: renterIdentity.email, renterPhone: renterIdentity.phone, delegatedTo: `${renterIdentity.phone} · ${renterIdentity.email}`, stake: 7000, ratePerDay: 3600, status: "CLOSED", createdAt: "Yesterday" },
  { id: "contract-3", carId: "car-3", renter: customerWallet.holder, renterEmail: renterIdentity.email, renterPhone: renterIdentity.phone, delegatedTo: `${renterIdentity.phone} · ${renterIdentity.email}`, stake: 10000, ratePerDay: 6800, status: "APPROVED", createdAt: "Today" },
  { id: "contract-4", carId: "car-2", renter: "Brian O.", renterEmail: "brian.otieno@example.co.ke", renterPhone: "+254 733 110 204", delegatedTo: "+254 733 110 204 · brian.otieno@example.co.ke", stake: 7000, ratePerDay: 3600, status: "REQUESTED", createdAt: "13:40" },
];

export const publicContractPreviews: HireContract[] = [
  ...mockHireContracts,
  { id: "contract-5", carId: "car-1", renter: "Grace M.", renterEmail: "grace.muthoni@example.co.ke", renterPhone: "+254 700 884 117", delegatedTo: "+254 700 884 117 · grace.muthoni@example.co.ke", stake: 8500, ratePerDay: 4200, status: "APPROVED", createdAt: "11:20" },
  { id: "contract-6", carId: "car-4", renter: "Kevin N.", renterEmail: "kevin.njoroge@example.co.ke", renterPhone: "+254 745 612 889", delegatedTo: "+254 745 612 889 · kevin.njoroge@example.co.ke", stake: 9000, ratePerDay: 5200, status: "REQUESTED", createdAt: "10:55" },
  { id: "contract-7", carId: "car-3", renter: "Lydia A.", renterEmail: "lydia.achieng@example.co.ke", renterPhone: "+254 721 908 144", delegatedTo: "+254 721 908 144 · lydia.achieng@example.co.ke", stake: 10000, ratePerDay: 6800, status: "ACTIVE", createdAt: "08:45" },
];

export function getPublicContractPreviews(limit = 6) {
  return [...publicContractPreviews]
    .sort((a, b) => a.id.localeCompare(b.id))
    .sort((a, b) => ((a.stake + a.ratePerDay) % 7) - ((b.stake + b.ratePerDay) % 7))
    .slice(0, limit);
}

export const mockHireBundles: FleetHireBundle[] = [
  {
    id: "bundle-seed-1",
    renter: "Brian O.",
    renterEmail: "brian.otieno@example.co.ke",
    renterPhone: "+254 733 110 204",
    carIds: ["car-2", "car-3"],
    totalStake: 9000,
    perCarStake: 4500,
    days: 4,
    status: "REQUESTED",
    createdAt: "13:50",
  },
];

export function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function getAvailabilityRules(car: FleetCar, walletBalance: number): AvailabilityRule[] {
  return [
    { id: `${car.id}-listed`, carId: car.id, label: "Owner listed", detail: car.ownerListed ? "Visible to renters" : "Hidden by owner", pass: car.ownerListed },
    { id: `${car.id}-status`, carId: car.id, label: "Vehicle free", detail: car.available ? "No active hire contract" : "Currently hired", pass: car.available },
    { id: `${car.id}-wallet`, carId: car.id, label: "Wallet minimum", detail: `${formatKes(car.requiresWalletMinimum)} required before handover`, pass: walletBalance >= car.requiresWalletMinimum },
    { id: `${car.id}-hours`, carId: car.id, label: "Pickup window", detail: car.allowedHours, pass: true },
    { id: `${car.id}-duration`, carId: car.id, label: "Maximum hire", detail: `${car.maxHireDays} days per contract`, pass: true },
  ];
}
