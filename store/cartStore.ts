"use client";
import { create } from "zustand";
import { CartItem, Product, ToastMessage } from "@/lib/types";

interface CartStore {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number, selectedCover?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Toast
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  // Cart state
  cartItems: [],
  isCartOpen: false,

  addToCart: (product, quantity = 1, selectedCover) => {
    const existing = get().cartItems.find(
      (item) => item.product.id === product.id && item.selectedCover === selectedCover
    );
    if (existing) {
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.product.id === product.id && item.selectedCover === selectedCover
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      }));
    } else {
      set((state) => ({
        cartItems: [...state.cartItems, { product, quantity, selectedCover }],
      }));
    }
    get().addToast(`Đã thêm "${product.name}" vào giỏ hàng`, "success");
    get().toggleCart();
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ cartItems: [] }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  closeCart: () => set({ isCartOpen: false }),

  getCartTotal: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getCartCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Wishlist state
  wishlist: [],

  toggleWishlist: (productId) => {
    const current = get().wishlist;
    if (current.includes(productId)) {
      set({ wishlist: current.filter((id) => id !== productId) });
      get().addToast("Đã xóa khỏi danh sách yêu thích", "info");
    } else {
      set({ wishlist: [...current, productId] });
      get().addToast("Đã thêm vào danh sách yêu thích", "success");
    }
  },

  isInWishlist: (productId) => get().wishlist.includes(productId),

  // Toast state
  toasts: [],

  addToast: (message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
