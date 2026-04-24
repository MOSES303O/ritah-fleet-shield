import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after client-side mount.
 * Reliable fix for hydration mismatches caused by Date/Intl/random/localStorage.
 */
export default function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
