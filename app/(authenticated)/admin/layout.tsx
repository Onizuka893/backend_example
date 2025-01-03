import { getSessionAdminRoleOrRedirect } from "@/lib/server/mediators";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const profile = await getSessionAdminRoleOrRedirect();
  return <>{children}</>;
}
