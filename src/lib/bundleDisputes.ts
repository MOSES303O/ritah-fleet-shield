// Shared dispute store synced via localStorage so admin actions surface to renters.

export type DisputeAttachment = { name: string; size: number };

export type DisputeHistoryEvent = {
  id: string;
  at: string;
  actor: "ADMIN" | "RENTER" | "SYSTEM";
  action: "FILED" | "ATTACHMENT_ADDED" | "OVERRIDE_AUTHORISED" | "CLEARED" | "RENTER_ACK";
  detail: string;
};

export type BundleDispute = {
  bundleId: string;
  reason: string;
  overrideApproved: boolean;
  createdAt: string;
  attachments: DisputeAttachment[];
  history: DisputeHistoryEvent[];
};

const KEY = "ritah:bundle-disputes";
const EVT = "ritah:bundle-disputes-updated";

export function getDisputes(): Record<string, BundleDispute> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, BundleDispute>) : {};
  } catch {
    return {};
  }
}

export function saveDisputes(next: Record<string, BundleDispute>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
}

export function subscribeDisputes(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function nowLabel() {
  return new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export function appendEvent(d: BundleDispute, ev: Omit<DisputeHistoryEvent, "id" | "at">): BundleDispute {
  return {
    ...d,
    history: [
      ...d.history,
      { id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: nowLabel(), ...ev },
    ],
  };
}
