import { useEffect, useState } from "react";

export type Role = "owner" | "renter" | "admin";

export type Session = {
  phone: string;
  name: string;
  role: Role;
  kycVerified: boolean;
  createdAt: string;
};

const KEY = "ritah.session";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
  else window.localStorage.removeItem(KEY);
  notify();
}

export function logout() {
  setSession(null);
}

export function useSession() {
  const [session, setLocal] = useState<Session | null>(() => getSession());
  useEffect(() => {
    const cb = () => setLocal(getSession());
    listeners.add(cb);
    window.addEventListener("storage", cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", cb);
    };
  }, []);
  return session;
}

export function hasRole(session: Session | null, roles: Role[]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}
