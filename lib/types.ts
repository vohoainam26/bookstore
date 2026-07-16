export interface Product {
  id: string;
  slug: string;
  name: string;
  author: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  category: string;
  subcategory: string;
  imageUrl: string;
  images: string[];
  badge?: "Bestseller" | "New" | "Sale" | "Hot";
  description: string;
  specs: {
    pages?: number;
    size?: string;
    publisher?: string;
    language?: string;
    weight?: string;
    material?: string;
  };
  coverType?: "Bìa cứng" | "Bìa mềm";
  inStock: boolean;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCover?: string;
  selectedColor?: string;
}

export interface WishlistItem {
  productId: string;
}

export interface Order {
  id: string;
  date: string;
  status: "Đang xử lý" | "Đang giao" | "Đã giao" | "Đã hủy";
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  count: number;
  subcategories: { name: string; slug: string }[];
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}
