// Mock backend: persists pilot signups to localStorage.
// Swap with Lovable Cloud later for true persistence.

export type Signup = {
  id: string;
  email: string;
  createdAt: string;
};

const KEY = "ritah:signups";

function read(): Signup[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(list: Signup[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("ritah:signups-updated"));
}

export function getSignups(): Signup[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addSignup(email: string): Signup {
  const clean = email.trim().toLowerCase();
  const list = read();
  const existing = list.find((s) => s.email === clean);
  if (existing) return existing;
  const entry: Signup = {
    id: crypto.randomUUID(),
    email: clean,
    createdAt: new Date().toISOString(),
  };
  write([entry, ...list]);
  return entry;
}

export function clearSignups() {
  write([]);
}
