import { createClient } from "@/lib/supabase/server";
import { checkBookingConflict } from "@/lib/utils/business-logic-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const courtId = searchParams.get("court_id");
  const status = searchParams.get("status");

  const supabase = await createClient();

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

  if (userId) {
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
  const {
    court_id,
    booking_date,
    start_time,
    end_time,
    sport,
    team_id,
    total_amount,
  } = body;

  // Check for booking conflicts
  const hasConflict = await checkBookingConflict(
    court_id,
    booking_date,
    start_time,
    end_time
  );

  if (hasConflict) {
    return NextResponse.json(
      { error: "This time slot is already booked" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      court_id,
      booked_by: user.id,
      team_id,
      booking_date,
      start_time,
      end_time,
      sport,
      total_amount,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}
