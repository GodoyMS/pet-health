/**
 * Whether the viewer asked the OS to minimise animation. Checked at call time
 * (not cached) so toggling the system setting takes effect without a reload.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
