/**
 * Dashboard segment template.
 *
 * Kept intentionally animation-free: a fade/slide on every navigation made
 * sidebar clicks feel laggy even after the RSC payload arrived. Instant paint
 * of `loading.tsx` → page content reads as snappy.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
