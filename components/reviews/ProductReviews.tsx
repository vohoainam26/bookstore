"use client";

import { useEffect, useState } from "react";
import { ReviewSummary, ReviewList, ReviewForm } from "./review-components";
import { getProductRatingSummary, getProductReviews, canCurrentUserReview, getCurrentUserReview, Review } from "@/lib/data/reviews";

export default function ProductReviews({ bookId, productSlug, user }: { bookId: number, productSlug: string, user: unknown }) {
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      const [sum, revs, canRev, myRev] = await Promise.all([
        getProductRatingSummary(bookId),
        getProductReviews(bookId, 1, 10),
        canCurrentUserReview(bookId),
        getCurrentUserReview(bookId)
      ]);

      if (active) {
        setSummary(sum);
        setReviews(revs.reviews);
        setCanReview(canRev);
        setMyReview(myRev);
        setLoading(false);
      }
    }

    loadData();
    return () => { active = false; };
  }, [bookId, user]); // Refetch if user changes

  if (loading) return <div className="p-6 text-center text-gray-500">Đang tải đánh giá...</div>;

  return (
    <div>
      <ReviewSummary 
        averageRating={summary.averageRating}
        totalReviews={summary.totalReviews}
        stars={summary.stars}
        canReview={canReview}
        hasReviewed={!!myReview}
        user={user}
        onOpenForm={() => setShowForm(true)}
      />
      
      {showForm && canReview && !myReview && (
        <ReviewForm 
          bookId={bookId}
          productSlug={productSlug}
          onSuccess={() => {
            setShowForm(false);
            // Optionally we could reload data here, but revalidatePath will refresh the page anyway
          }}
        />
      )}

      <ReviewList reviews={reviews} />
    </div>
  );
}
