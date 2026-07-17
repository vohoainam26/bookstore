"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { InstagramLogo, FacebookLogo, TiktokLogo, EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Lấy user hiện tại
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Lắng nghe thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{ background: "var(--color-brand)", color: "white" }}>
      {/* Newsletter strip */}
      {!user && (
        <div
          style={{
            background: "var(--color-brand-light)",
            borderBottom: "1px solid rgb(255 255 255 / 0.10)",
          }}
        >
        <div className="w-full mx-auto px-4 lg:px-8 py-12" style={{ maxWidth: "1280px" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Nhận tin khuyến mãi sớm nhất
              </h3>
              <p className="text-sm" style={{ color: "rgb(255 255 255 / 0.70)" }}>
                Đăng ký để nhận thông báo sách mới và ưu đãi độc quyền
              </p>
            </div>
            <form
              className="flex gap-3 w-full md:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) {
                  router.push(`/account/register?email=${encodeURIComponent(email)}`);
                } else {
                  router.push(`/account/register`);
                }
              }}
            >
              <div className="relative flex-1 md:w-72">
                <EnvelopeSimple
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgb(255 255 255 / 0.50)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full pl-10 pr-4 py-3 rounded-full text-sm border-0 focus:outline-none focus:ring-2"
                  style={{
                    background: "rgb(255 255 255 / 0.12)",
                    color: "white",
                    borderColor: "rgb(255 255 255 / 0.20)",
                    border: "1px solid rgb(255 255 255 / 0.20)",
                  }}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 flex-shrink-0"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-stone-950)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* Main footer */}
      <div className="w-full mx-auto px-4 lg:px-8 py-12" style={{ maxWidth: "1280px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-accent)" }}
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: "var(--color-stone-950)", fontFamily: "var(--font-outfit)" }}
                >
                  T
                </span>
              </div>
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Trang Sách
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "rgb(255 255 255 / 0.65)" }}
            >
              Cửa hàng sách và văn phòng phẩm cao cấp. Chúng tôi tuyển chọn kỹ lưỡng từng sản phẩm để mang đến trải nghiệm đọc và viết tốt nhất.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgb(255 255 255 / 0.65)" }}>
                <MapPin size={14} />
                <span>42 Đinh Tiên Hoàng, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgb(255 255 255 / 0.65)" }}>
                <Phone size={14} />
                <span>028 3823 1947</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgb(255 255 255 / 0.65)" }}>
                <EnvelopeSimple size={14} />
                <span>xin.chao@trangsach.vn</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Cửa hàng
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Sách mới nhất", href: "/new-books" },
                { label: "Sách bán chạy", href: "/best-sellers" },
                { label: "Văn phòng phẩm", href: "/stationery" },
                { label: "Quà tặng", href: "/gifts" },
                { label: "Blog", href: "/blog" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors duration-150 hover:text-white"
                    style={{ color: "rgb(255 255 255 / 0.60)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Hỗ trợ
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Hướng dẫn mua hàng", href: "/shopping-guide" },
                { label: "Theo dõi đơn hàng", href: "/track-order" },
                { label: "Đổi trả hàng", href: "/returns" },
                { label: "Câu hỏi thường gặp", href: "/faq" },
                { label: "Liên hệ chúng tôi", href: "/contact" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors duration-150 hover:text-white"
                    style={{ color: "rgb(255 255 255 / 0.60)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Về chúng tôi
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Câu chuyện của Trang", href: "/about" },
                { label: "Chính sách bảo mật", href: "/privacy-policy" },
                { label: "Điều khoản dịch vụ", href: "/terms-of-service" },
                { label: "Chính sách vận chuyển", href: "/shipping-policy" },
                { label: "Chương trình thành viên", href: "/membership" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors duration-150 hover:text-white"
                    style={{ color: "rgb(255 255 255 / 0.60)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgb(255 255 255 / 0.10)" }}
        >
          <p className="text-xs" style={{ color: "rgb(255 255 255 / 0.45)" }}>
            2025 Trang Sách. Bản quyền thuộc về Trang Sách.
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: FacebookLogo, label: "Facebook" },
              { Icon: InstagramLogo, label: "Instagram" },
              { Icon: TiktokLogo, label: "TikTok" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: "rgb(255 255 255 / 0.12)",
                  color: "white",
                  border: "1px solid rgb(255 255 255 / 0.12)",
                }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
