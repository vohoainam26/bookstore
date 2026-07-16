"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, ShoppingBag, Star } from "@phosphor-icons/react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const BADGE_STYLES = {
  Bestseller: { bg: "var(--color-brand)", text: "white" },
  New: { bg: "var(--color-accent)", text: "var(--color-stone-950)" },
  Sale: { bg: "#b91c1c", text: "white" },
  Hot: { bg: "var(--color-forest-700)", text: "white" },
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCartStore();
  const wished = isInWishlist(product.id);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="product-card-hover group relative flex flex-col"
      style={{
        background: "var(--color-surface-overlay)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
      whileHover={{
        y: -4,
        boxShadow: "var(--shadow-card-hover)",
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: "var(--color-stone-50)" }}>
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: (BADGE_STYLES[product.badge as keyof typeof BADGE_STYLES] || BADGE_STYLES.Sale).bg,
              color: (BADGE_STYLES[product.badge as keyof typeof BADGE_STYLES] || BADGE_STYLES.Sale).text,
              fontFamily: "var(--font-outfit)",
            }}
          >
            {product.badge === "Sale" ? `-${discount}%` : product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: wished
              ? "var(--color-accent)"
              : "white",
            boxShadow: "0 2px 8px rgb(0 0 0 / 0.12)",
          }}
          aria-label={wished ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart
            size={15}
            weight={wished ? "fill" : "regular"}
            style={{ color: wished ? "white" : "var(--color-text-secondary)" }}
          />
        </button>

        {/* Add to cart overlay */}
        <div className="product-card-actions absolute bottom-3 left-3 right-3">
          <button
            onClick={() => addToCart(product, 1)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--color-brand)",
              color: "white",
              fontFamily: "var(--font-outfit)",
              boxShadow: "0 4px 16px rgb(26 58 46 / 0.30)",
            }}
          >
            <ShoppingBag size={15} />
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
          {product.author}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 mb-2 hover:text-[var(--color-brand)] transition-colors duration-150"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              weight={i < Math.floor(product.rating) ? "fill" : "regular"}
              style={{ color: i < Math.floor(product.rating) ? "var(--color-accent)" : "var(--color-stone-300)" }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span
            className="font-bold text-base"
            style={{ color: "var(--color-accent)", fontFamily: "var(--font-outfit)" }}
          >
            {product.price.toLocaleString("vi-VN")}đ
          </span>
          {product.originalPrice > product.price && (
            <span
              className="text-xs price-original"
              style={{ color: "var(--color-text-muted)" }}
            >
              {product.originalPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
