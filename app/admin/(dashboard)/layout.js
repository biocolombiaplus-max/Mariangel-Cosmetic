import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminShell from "@/components/admin/admin-shell";

export default async function AdminDashboardLayout({ children }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
