import { createClient } from "@/lib/supabase/server";
import { checkBookingConflict } from "@/lib/utils/business-logic-server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
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
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can update bookings" },
      { status: 403 },
    );
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
    status,
    user_id,
  } = body;

  // Check for booking conflicts (excluding current booking)
  const hasConflict = await checkBookingConflict(
    court_id,
    booking_date,
    start_time,
    end_time,
    id, // Exclude this booking from conflict check
  );

  if (hasConflict) {
    return NextResponse.json(
      { error: "This time slot is already booked" },
      { status: 409 },
    );
  }

  const updateData: Record<string, unknown> = {
    court_id,
    booking_date,
    start_time,
    end_time,
    sport,
    total_amount,
    updated_at: new Date().toISOString(),
  };

  // Only update status if provided
  if (status) {
    updateData.status = status;
  }

  // Only update booked_by if user_id is provided
  if (user_id) {
    updateData.booked_by = user_id;
  }

  // Only update team_id if provided
  if (team_id !== undefined) {
    updateData.team_id = team_id;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin or the booking owner
  const { data: booking } = await supabase
    .from("bookings")
    .select("booked_by")
    .eq("id", id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwner = booking.booked_by === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "You can only delete your own bookings" },
      { status: 403 },
    );
  }

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Booking deleted successfully" });
}
