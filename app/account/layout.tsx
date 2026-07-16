import { createClient } from "@/lib/supabase/server";
import { User, SignOut } from "@phosphor-icons/react/dist/ssr";
import { signOutAction } from "./actions";
import AccountSidebar from "@/components/account/AccountSidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || "Khách hàng";
  const email = user?.email || "";

  return (
    <div style={{ background: "var(--color-surface)", minHeight: "100vh" }}>
      <div className="w-full mx-auto px-4 lg:px-8 py-8 lg:py-12" style={{ maxWidth: "1280px" }}>
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-forest-100)" }}
            >
              <User size={24} style={{ color: "var(--color-brand)" }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
              >
                Xin chào, {fullName}
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {email}
              </p>
            </div>
          </div>
          
          <form action={signOutAction}>
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border border-red-200 text-red-600 hover:bg-red-50"
            >
              <SignOut size={16} />
              Đăng xuất
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
