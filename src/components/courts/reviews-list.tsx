"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Star } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/providers/i18n-provider";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewsListProps {
  reviews: Review[];
  courtId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewsList({ reviews, courtId, onReviewSubmitted }: ReviewsListProps) {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: recentBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("court_id", courtId)
        .eq("booked_by", user.id)
        .eq("status", "confirmed")
        .order("booking_date", { ascending: false })
        .limit(1)
        .single();

      if (!recentBooking) {
        throw new Error(t("reviews.bookingRequired", "You need a confirmed booking before leaving a review."));
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          court_id: courtId,
          booking_id: recentBooking.id,
          rating,
          comment: comment || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || t("reviews.errorToast", "Failed to submit review"));
      }

      setShowForm(false);
      setComment("");
      setRating(5);
      toast.success(t("reviews.successToast", "Review submitted successfully."));
      onReviewSubmitted?.();
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("reviews.errorToast", "An unexpected error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">{t("courtDetail.tabs.reviews", "Court reviews")}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">{t("reviews.title", "Feedback from recent sessions")}</h2>
        </div>
        <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((current) => !current)} className="rounded-full px-5">
          {showForm ? t("common.cancel", "Cancel") : t("reviews.writeReview", "Write a review")}
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="surface-panel rounded-[1.85rem] px-5 py-5">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <p className="section-kicker text-[0.68rem]">{t("reviews.rating", "Rating")}</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`rounded-full p-2 transition-colors ${
                      value <= rating ? "text-amber-500" : "text-muted-foreground/35"
                    }`}
                  >
                    <Star className="size-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <p className="section-kicker text-[0.68rem]">{t("common.comment", "Comment")}</p>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("reviews.commentPlaceholder", "Describe the court, surface, atmosphere, and reliability of the booking.")}
                className="min-h-32 rounded-[1.4rem]"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="rounded-full px-6" disabled={loading}>
                {loading ? t("reviews.submitting", "Submitting...") : t("reviews.submitReview", "Submit review")}
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      {reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="surface-panel rounded-[1.85rem] px-5 py-5">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 font-display text-lg font-semibold text-primary">
                  {review.profiles?.full_name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium text-foreground">{review.profiles?.full_name || t("common.anonymous", "Anonymous")}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="size-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title={t("reviews.noReviews", "No reviews yet")}
          description={t("reviews.noReviewsDesc", "Be the first player to share how the court felt, how the booking held up, and whether the venue matched the listing.")}
        />
      )}
    </div>
  );
}
