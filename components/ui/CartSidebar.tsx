"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  X,
  Minus,
  Plus,
  Trash,
  ShoppingBag,
  Tag,
  ArrowRight,
  SpinnerGap,
  CheckCircle,
} from "@phosphor-icons/react";
import { useCartStore } from "@/store/cartStore";
import { previewCoupon, CheckoutTotals } from "@/app/checkout/coupon-actions";

export default function CartSidebar() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<CheckoutTotals | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const total = couponData ? couponData.subtotal : getCartTotal();
  const shipping = couponData ? couponData.shipping_fee : (total >= 200000 ? 0 : 30000);
  const discountAmount = couponData ? couponData.discount_amount : 0;
  const shippingDiscount = couponData ? couponData.shipping_discount_amount : 0;
  const finalTotal = couponData ? couponData.total_amount : (total + shipping);

  // If cart changes, we should clear the coupon (or re-validate, but clearing is easier)
  useEffect(() => {
    if (couponData) {
      setCouponData(null);
      setCouponError("Giỏ hàng thay đổi, vui lòng áp dụng lại mã giảm giá.");
    }
  }, [cartItems]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCode.trim()) return;
    
    setApplyingCoupon(true);
    setCouponError(null);
    const items = cartItems.map(i => ({ book_id: parseInt(i.product.id), quantity: i.quantity }));
    const res = await previewCoupon(items, couponCode);
    if (res.success && res.data) {
      if (res.data.coupon_valid) {
        setCouponData(res.data);
      } else {
        setCouponError(res.data.message || "Mã giảm giá không hợp lệ");
        setCouponData(null);
      }
    } else {
      setCouponError(res.error || "Có lỗi xảy ra");
      setCouponData(null);
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponCode("");
    setCouponError(null);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col w-full max-w-[440px]"
            style={{
              background: "var(--color-surface-overlay)",
              boxShadow: "var(--shadow-modal)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} style={{ color: "var(--color-brand)" }} />
                <h2
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-outfit)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Giỏ hàng
                </h2>
                {cartItems.length > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--color-forest-100)",
                      color: "var(--color-brand)",
                    }}
                  >
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-stone-100)]"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Đóng giỏ hàng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "var(--color-stone-100)" }}
                  >
                    <ShoppingBag size={32} style={{ color: "var(--color-text-muted)" }} />
                  </div>
                  <p
                    className="font-semibold mb-2"
                    style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
                  >
                    Giỏ hàng trống
                  </p>
                  <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                    Thêm sản phẩm vào giỏ để tiếp tục mua sắm
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90"
                    style={{
                      background: "var(--color-brand)",
                      color: "white",
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.selectedCover}`}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-4 p-4 rounded-2xl"
                        style={{ background: "var(--color-stone-50)" }}
                      >
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="flex-shrink-0"
                        >
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-[90px] object-cover rounded-xl"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                          >
                            <p
                              className="font-semibold text-sm line-clamp-2 hover:text-[var(--color-brand)] transition-colors"
                              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
                            >
                              {item.product.name}
                            </p>
                          </Link>
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {item.product.author}
                          </p>
                          {item.selectedCover && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                              {item.selectedCover}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity */}
                            <div
                              className="flex items-center gap-1 rounded-full"
                              style={{
                                background: "var(--color-surface-overlay)",
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--color-stone-100)]"
                                style={{ color: "var(--color-text-secondary)" }}
                                aria-label="Giảm số lượng"
                              >
                                <Minus size={12} weight="bold" />
                              </button>
                              <span
                                className="text-sm font-semibold w-6 text-center"
                                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-outfit)" }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--color-stone-100)]"
                                style={{ color: "var(--color-text-secondary)" }}
                                aria-label="Tăng số lượng"
                              >
                                <Plus size={12} weight="bold" />
                              </button>
                            </div>

                            {/* Price + delete */}
                            <div className="flex items-center gap-2">
                              <p
                                className="text-sm font-bold"
                                style={{ color: "var(--color-accent)", fontFamily: "var(--font-outfit)" }}
                              >
                                {(item.product.price * item.quantity).toLocaleString("vi-VN")}đ
                              </p>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                                style={{ color: "var(--color-text-muted)" }}
                                aria-label="Xóa sản phẩm"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Summary + CTA */}
            {cartItems.length > 0 && (
              <div
                className="px-6 py-5"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                {/* Coupon */}
                <div className="mb-4">
                  {!couponData?.coupon_valid ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--color-text-muted)" }}
                        />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Nhập mã giảm giá"
                          disabled={applyingCoupon}
                          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-full border focus:outline-none uppercase"
                          style={{
                            background: "var(--color-stone-50)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex justify-center items-center"
                        style={{
                          background: "var(--color-stone-200)",
                          color: "var(--color-text-primary)",
                          fontFamily: "var(--font-outfit)",
                        }}
                      >
                        {applyingCoupon ? <SpinnerGap size={16} className="animate-spin" /> : "Áp dụng"}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-green-700 flex items-center gap-1.5 text-sm">
                          <CheckCircle size={16} weight="fill" />
                          Đã áp dụng mã {couponData.coupon_code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        disabled={applyingCoupon}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                        title="Xoá mã"
                      >
                        <X size={16} weight="bold" />
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-500 text-xs mt-2 pl-2">{couponError}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <span>Tạm tính</span>
                    <span style={{ fontFamily: "var(--font-outfit)" }}>
                      {total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <span>Phí vận chuyển</span>
                    <span
                      style={{
                        color: shipping === 0 ? "var(--color-forest-600)" : "var(--color-text-secondary)",
                        fontFamily: "var(--font-outfit)",
                      }}
                    >
                      {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span style={{ fontFamily: "var(--font-outfit)" }}>
                        -{discountAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {shippingDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm phí vận chuyển</span>
                      <span style={{ fontFamily: "var(--font-outfit)" }}>
                        -{shippingDiscount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {shipping > 0 && shippingDiscount < shipping && (
                    <p className="text-xs" style={{ color: "var(--color-accent)" }}>
                      Mua thêm {(200000 - total).toLocaleString("vi-VN")}đ để được miễn phí ship
                    </p>
                  )}
                  <div
                    className="flex justify-between font-bold text-base pt-3"
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-outfit)" }}>Tổng cộng</span>
                    <span style={{ color: "var(--color-accent)", fontFamily: "var(--font-outfit)" }}>
                      {finalTotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <Link
                  href={couponData?.coupon_code ? `/checkout?coupon=${couponData.coupon_code}` : "/checkout"}
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "var(--color-brand)",
                    color: "white",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  Tiến hành thanh toán
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
