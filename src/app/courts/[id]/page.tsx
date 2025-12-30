import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BookingForm from "@/components/courts/booking-form";
import ReviewsList from "@/components/courts/reviews-list";
import CourtGallery from "@/components/courts/court-gallery";

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: court, error } = await supabase
    .from("courts")
    .select(
      `
      *,
      court_images (
        id,
        url,
        is_primary,
        display_order
      ),
      court_availability (
        id,
        day_of_week,
        start_time,
        end_time,
        is_available
      ),
      profiles!courts_owner_id_fkey (
        id,
        full_name,
        avatar_url,
        phone
      ),
      reviews (
        id,
        rating,
        comment,
        created_at,
        profiles!reviews_reviewer_id_fkey (
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !court) {
    notFound();
  }

  // Calculate average rating
  const avgRating =
    court.reviews && court.reviews.length > 0
      ? (
          court.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          court.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/courts"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Courts
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Court Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <CourtGallery
              images={court.court_images || []}
              courtName={court.name}
            />

            {/* Court Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {court.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {court.address}, {court.city}
                  </p>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-500">
                      ★
                    </span>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {avgRating}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      ({court.reviews?.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {court.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {court.description}
                </p>
              )}

              {/* Sports */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Available Sports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {court.sports?.map((sport: string) => (
                    <span
                      key={sport}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full font-semibold"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {court.amenities && court.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {court.amenities.map((amenity: string) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Payment Methods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {court.payment_methods?.map((method: string) => (
                    <span
                      key={method}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg"
                    >
                      {method === "card" ? "💳 Card" : "💵 Cash"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Owner Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Court Owner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {court.profiles?.full_name?.charAt(0) || "O"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {court.profiles?.full_name || "Court Owner"}
                    </p>
                    {court.profiles?.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {court.profiles.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <ReviewsList reviews={court.reviews || []} courtId={court.id} />
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  Price per hour
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${court.price_per_hour}
                </p>
              </div>

              <BookingForm
                courtId={court.id}
                sports={court.sports || []}
                pricePerHour={court.price_per_hour || 0}
                availability={court.court_availability || []}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
