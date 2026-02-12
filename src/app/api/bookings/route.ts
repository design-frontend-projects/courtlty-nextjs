import { createClient } from "@/lib/supabase/server";
import { checkBookingConflict } from "@/lib/utils/business-logic-server";
import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const courtId = searchParams.get("court_id");
  const status = searchParams.get("status");

  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  const isAdmin = profile?.role === "admin";

  let query = supabase.from("bookings").select(`
      *,
      courts (
        id,
        name,
        address,
        city,
        court_images (url, is_primary)
      ),
      profiles!bookings_booked_by_fkey (
        id,
        full_name,
        avatar_url
      ),
      teams (
        id,
        name,
        logo_url
      )
    `);

  // Security: Users can only see their own bookings unless admin
  if (!isAdmin) {
    query = query.eq("booked_by", currentUser.id);
  } else if (userId) {
    // Admin can filter by userId
    query = query.eq("booked_by", userId);
  }

  if (courtId) {
    query = query.eq("court_id", courtId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("booking_date", {
    ascending: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

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
  const validation = bookingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 },
    );
  }

  const {
    court_id,
    booking_date,
    start_time,
    end_time,
    sport,
    team_id,
    total_amount,
    user_id: requestedUserId,
  } = validation.data;

  // Check if current user is admin to allow overriding booked_by
  let bookingUserId = user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin" && requestedUserId) {
    bookingUserId = requestedUserId;
  }

  // Check for booking conflicts
  const hasConflict = await checkBookingConflict(
    court_id,
    booking_date,
    start_time,
    end_time,
  );

  if (hasConflict) {
    return NextResponse.json(
      { error: "This time slot is already booked" },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      court_id,
      booked_by: bookingUserId,
      team_id,
      booking_date,
      start_time,
      end_time,
      sport,
      total_amount,
      status: profile?.role === "admin" ? "confirmed" : "pending",
      payment_status: profile?.role === "admin" ? "paid" : "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}
