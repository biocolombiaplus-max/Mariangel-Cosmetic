import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminDashboardLayout({ children }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
