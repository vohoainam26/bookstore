import { createClient } from "@/lib/supabase/server";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || "";
  const email = user?.email || "";

  return (
    <div>
      <h2 className="text-xl font-bold mb-6" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}>
        Cài đặt tài khoản
      </h2>
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: "var(--color-surface-overlay)", border: "1px solid var(--color-border)" }}
      >
        {[
          { label: "Họ và tên", value: fullName, type: "text" },
          { label: "Email", value: email, type: "email" },
          { label: "Số điện thoại", value: "0912 345 678", type: "tel" },
          { label: "Ngày sinh", value: "15/03/1995", type: "text" },
        ].map(({ label, value, type }) => (
          <div key={label}>
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              {label}
            </label>
            <div className="relative">
              <input
                type={type}
                defaultValue={value}
                className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all"
                style={{
                  background: "var(--color-stone-50)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              />
              <PencilSimple
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
            </div>
          </div>
        ))}
        <button
          className="w-full py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "var(--color-brand)",
            color: "white",
            fontFamily: "var(--font-outfit)",
          }}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
