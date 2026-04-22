export type FleetCar = {
  id: string;
  reg: string;
  make: string;
  model: string;
  seats: number;
  location: string;
  ratePerDay: number;
  stake: number;
  available: boolean;
  ownerListed: boolean;
};

export type Wallet = {
  holder: string;
  balance: number;
  verified: boolean;
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
    available: false,
    ownerListed: true,
  },
];

export function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}