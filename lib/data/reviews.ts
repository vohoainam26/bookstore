"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Review = {
  id: number;
  user_id: string;
  book_id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string; // Appended from auth if available, or "Khách hàng đã mua"
};

export async function getProductRatingSummary(bookId: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("book_id", bookId);

  if (error || !data) {
    return { averageRating: 0, totalReviews: 0, stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }

  const totalReviews = data.length;
  if (totalReviews === 0) {
    return { averageRating: 0, totalReviews: 0, stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }

  const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  data.forEach((r) => {
    sum += r.rating;
    if (r.rating >= 1 && r.rating <= 5) {
      stars[r.rating as keyof typeof stars]++;
    }
  });

  const averageRating = sum / totalReviews;

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
    stars
  };
}

export async function getProductReviews(bookId: number, page = 1, limit = 5): Promise<{ reviews: Review[]; total: number }> {
  const supabase = await createClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("product_reviews")
    .select("*", { count: "exact" })
    .eq("book_id", bookId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    return { reviews: [], total: 0 };
  }

  const reviews = data.map((r: Record<string, unknown>) => {
    return {
      id: r.id as number,
      user_id: r.user_id as string,
      book_id: r.book_id as number,
      rating: r.rating as number,
      review_text: r.review_text as string | null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      user_name: "Khách hàng đã mua" // Supabase doesn't allow joining auth.users easily without a public view
    };
  });

  return { reviews, total: count || 0 };
}

export async function canCurrentUserReview(bookId: number): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase.rpc("has_purchased_book", {
    p_book_id: bookId
  });

  if (error) {
    console.error("Error checking purchase status:", error);
    return false;
  }

  return !!data;
}

export async function getCurrentUserReview(bookId: number): Promise<Review | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  return data as Review;
}

export async function createOrUpdateReview(bookId: number, rating: number, reviewText: string, productSlug: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Bạn chưa đăng nhập" };

    if (rating < 1 || rating > 5) return { success: false, error: "Đánh giá không hợp lệ" };

    // Try to update first, if error, try to insert (upsert doesn't work if user_id is the conflict but we don't have primary key id, we have unique constraint)
    const { error } = await supabase
      .from("product_reviews")
      .upsert(
        { user_id: user.id, book_id: bookId, rating, review_text: reviewText },
        { onConflict: "user_id, book_id" }
      );

    if (error) {
      console.error("Error upserting review:", error);
      return { success: false, error: "Bạn chưa mua sản phẩm này hoặc đơn chưa giao" };
    }

    revalidatePath(`/products/${productSlug}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Lỗi hệ thống khi lưu đánh giá" };
  }
}
