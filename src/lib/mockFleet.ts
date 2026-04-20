// Deterministic-ish mock fleet generator for the Live Tracker + Admin pages.
export type Vehicle = {
  id: string;
  reg: string;
  driver: string;
  speed: number;
  limit: number;
  lat: number;
  lng: number;
  status: "OK" | "WARN" | "VIOLATION";
  stake: number;
  lastPing: string;
};

export type Violation = {
  id: string;
  ts: string;
  reg: string;
  driver: string;
  type: string;
  amount: number;
  status: "AUTO-SETTLED" | "PENDING" | "DISPUTED";
};

const DRIVERS = [
  "J. Mwangi",
  "S. Otieno",
  "A. Kamau",
  "M. Wanjiru",
  "P. Kariuki",
  "L. Achieng",
  "D. Njoroge",
  "F. Hassan",
];

const REGS = ["KDM 421X", "KCY 882P", "KDA 119H", "KDC 555Q", "KCB 700A", "KDD 314Z"];

const TYPES: Array<{ t: string; amt: number }> = [
  { t: "SPEED 92/80", amt: 3000 },
  { t: "LANE INDISC.", amt: 1500 },
  { t: "SEATBELT", amt: 500 },
  { t: "RED LIGHT", amt: 5000 },
  { t: "PHONE USE", amt: 2000 },
  { t: "OVERTAKING", amt: 4000 },
];

// Nairobi center
const NAIROBI = { lat: -1.2921, lng: 36.8219 };

export function seedFleet(): Vehicle[] {
  return REGS.map((reg, i) => ({
    id: `v-${i}`,
    reg,
    driver: DRIVERS[i % DRIVERS.length],
    speed: 40 + Math.floor(Math.random() * 50),
    limit: 80,
    lat: NAIROBI.lat + (Math.random() - 0.5) * 0.08,
    lng: NAIROBI.lng + (Math.random() - 0.5) * 0.08,
    status: "OK",
    stake: 8500,
    lastPing: new Date().toISOString(),
  }));
}

export function tickFleet(prev: Vehicle[]): Vehicle[] {
  return prev.map((v) => {
    const speed = Math.max(20, Math.min(120, v.speed + (Math.random() - 0.5) * 18));
    const lat = v.lat + (Math.random() - 0.5) * 0.004;
    const lng = v.lng + (Math.random() - 0.5) * 0.004;
    const status: Vehicle["status"] =
      speed > v.limit + 8 ? "VIOLATION" : speed > v.limit ? "WARN" : "OK";
    return {
      ...v,
      speed: Math.round(speed),
      lat,
      lng,
      status,
      lastPing: new Date().toISOString(),
    };
  });
}

export function maybeGenerateViolation(fleet: Vehicle[]): Violation | null {
  const offender = fleet.find((v) => v.status === "VIOLATION");
  if (!offender || Math.random() > 0.35) return null;
  const pick = TYPES[Math.floor(Math.random() * TYPES.length)];
  return {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    reg: offender.reg,
    driver: offender.driver,
    type: pick.t,
    amount: pick.amt,
    status: Math.random() > 0.15 ? "AUTO-SETTLED" : "PENDING",
  };
}

// Project lat/lng to an SVG viewBox 0..100 around Nairobi
export function project(lat: number, lng: number) {
  const x = ((lng - (NAIROBI.lng - 0.05)) / 0.1) * 100;
  const y = (1 - (lat - (NAIROBI.lat - 0.05)) / 0.1) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}
