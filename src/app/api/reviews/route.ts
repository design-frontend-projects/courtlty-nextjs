import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validations/schemas";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Server-side validation
  const validation = reviewSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 },
    );
  }

  const { court_id, booking_id, rating, comment } = validation.data;

  // Security: Verify that the booking actually belongs to the user
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("booked_by")
    .eq("id", booking_id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  if (booking.booked_by !== user.id) {
    return NextResponse.json(
      { error: "Wait, you can only review your own bookings!" },
      { status: 403 },
    );
  }

  // Check if review already exists for this booking
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking_id)
    .single();

  if (existingReview) {
    return NextResponse.json(
      { error: "You've already reviewed this booking" },
      { status: 409 },
    );
  }

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      court_id,
      booking_id,
      reviewer_id: user.id,
      rating,
      comment,
    })
    .select()
    .single();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}
