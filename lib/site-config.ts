export const siteConfig = {
  name: "Trang Sách",
  description: "Cửa hàng sách và văn phòng phẩm cao cấp. Chúng tôi tuyển chọn kỹ lưỡng từng sản phẩm để mang đến trải nghiệm đọc và viết tốt nhất.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "xin.chao@trangsach.vn",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "028 3823 1947",
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "42 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  },
  social: {
    facebook: "https://facebook.com/trangsach",
    instagram: "https://instagram.com/trangsach",
    tiktok: "https://tiktok.com/@trangsach"
  }
};
