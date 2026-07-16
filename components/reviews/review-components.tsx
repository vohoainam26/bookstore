"use client";

import { useState } from "react";
import { Star, User } from "@phosphor-icons/react";
import Link from "next/link";
import { createOrUpdateReview, Review } from "@/lib/data/reviews";
import { useCartStore } from "@/store/cartStore";

const RED = "#C92127";
const BLUE = "#1e3a8a";

export function ReviewForm({ 
  bookId, 
  productSlug, 
  onSuccess 
}: { 
  bookId: number; 
  productSlug: string; 
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await createOrUpdateReview(bookId, rating, text, productSlug);
    setLoading(false);
    
    if (res.success) {
      addToast("Cảm ơn bạn đã gửi đánh giá!", "success");
      if (onSuccess) onSuccess();
    } else {
      addToast(res.error || "Có lỗi xảy ra", "error");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-6">
      <h4 className="font-bold text-gray-900 mb-4">
        Viết đánh giá cho sản phẩm này
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chất lượng sản phẩm</label>
          <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  weight={(hoveredRating || rating) >= star ? "fill" : "regular"}
                  style={{ color: "#f59e0b" }}
                />
              </button>
            ))}
            <span className="ml-3 text-sm font-medium text-gray-500 self-center">
              {rating === 5 ? "Tuyệt vời" : rating === 4 ? "Tốt" : rating === 3 ? "Bình thường" : rating === 2 ? "Kém" : "Rất tệ"}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chia sẻ thêm (Tùy chọn)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bạn nghĩ gì về sản phẩm này?"
            maxLength={2000}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] border-gray-200"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: RED }}
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 font-medium text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <h4 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Khách hàng nhận xét</h4>
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-gray-900">{review.user_name}</span>
              <span className="text-xs text-gray-400">• {new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  weight={review.rating >= star ? "fill" : "regular"}
                  style={{ color: "#f59e0b" }}
                />
              ))}
            </div>
            {review.review_text && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{review.review_text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewSummary({ 
  averageRating, 
  totalReviews, 
  stars, 
  canReview,
  hasReviewed,
  user,
  onOpenForm
}: { 
  averageRating: number; 
  totalReviews: number; 
  stars: Record<number, number>;
  canReview: boolean;
  hasReviewed: boolean;
  user: unknown;
  onOpenForm: () => void;
}) {
  const BARS = [
    { star: 5, count: stars[5] || 0 }, 
    { star: 4, count: stars[4] || 0 },
    { star: 3, count: stars[3] || 0 },  
    { star: 2, count: stars[2] || 0 }, 
    { star: 1, count: stars[1] || 0 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
      <h3 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
        Đánh giá sản phẩm
      </h3>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Col 1 – Score */}
        <div className="flex flex-col items-center justify-center gap-2 min-w-[120px]">
          <span className="text-5xl font-black text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            {averageRating.toFixed(1)}<span className="text-2xl text-gray-400">/5</span>
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                weight={averageRating >= star ? "fill" : averageRating >= star - 0.5 ? "duotone" : "regular"}
                style={{ color: "#f59e0b" }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({totalReviews} đánh giá)</span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-100" />

        {/* Col 2 – Bars */}
        <div className="flex-1 flex flex-col gap-2 justify-center">
          {BARS.map(({ star, count }) => {
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-gray-500 font-medium text-right">{star}</span>
                <Star size={11} weight="fill" style={{ color: "#f59e0b" }} />
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "#f59e0b" }} />
                </div>
                <span className="w-7 text-gray-400 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-100" />

        {/* Col 3 – Action */}
        <div className="flex flex-col justify-center items-center gap-2 min-w-[200px] text-sm text-gray-500">
          {!user ? (
            <>
              <p className="leading-relaxed text-center">
                Đăng nhập để viết nhận xét
              </p>
              <div className="flex gap-2 w-full mt-1">
                <Link href="/account/login" className="flex-1 text-center py-2 rounded-lg font-semibold text-white text-xs transition-all hover:opacity-90"
                  style={{ background: RED }}>Đăng nhập</Link>
                <Link href="/account/register" className="flex-1 text-center py-2 rounded-lg font-semibold text-xs border-2 transition-all hover:bg-blue-50"
                  style={{ borderColor: BLUE, color: BLUE }}>Đăng ký</Link>
              </div>
            </>
          ) : hasReviewed ? (
             <p className="text-center font-medium text-green-700 px-2 bg-green-50 py-3 rounded-lg border border-green-100">
                Bạn đã đánh giá sản phẩm này.
             </p>
          ) : !canReview ? (
             <p className="text-center font-medium text-gray-600 px-2 bg-gray-50 py-3 rounded-lg border border-gray-100">
                Bạn cần mua và nhận hàng thành công để đánh giá.
             </p>
          ) : (
            <>
              <p className="leading-relaxed text-center font-medium text-gray-700">
                Chia sẻ cảm nhận của bạn
              </p>
              <button 
                onClick={onOpenForm}
                className="w-full py-2.5 rounded-lg font-bold text-white text-xs transition-all hover:opacity-90 mt-1"
                style={{ background: RED }}>
                Viết đánh giá
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
