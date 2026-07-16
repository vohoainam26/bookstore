import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Admin Dashboard | Bookstore",
  description: "Quản trị hệ thống",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopbar userName={profile.full_name || "Admin"} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
