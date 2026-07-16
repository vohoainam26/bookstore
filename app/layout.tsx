import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/ui/CartSidebar";
import ToastContainer from "@/components/ui/Toast";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Trang Sách - Sách & Văn phòng phẩm cao cấp",
    template: "%s | Trang Sách",
  },
  description:
    "Khám phá hơn 3.000 đầu sách văn học, kỹ năng sống, và bộ sưu tập văn phòng phẩm cao cấp. Giao hàng nhanh, đóng gói cẩn thận, chất lượng đảm bảo.",
  keywords: ["sách", "văn phòng phẩm", "bút cao cấp", "sổ tay", "mua sách online"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Trang Sách",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${outfit.variable} ${dmSans.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        }}
      >
        <Header />
        <main>{children}</main>
        <Footer />
        <CartSidebar />
        <ToastContainer />
      </body>
    </html>
  );
}
