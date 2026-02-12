import { createClient } from "@/lib/supabase/server";
import { checkBookingConflict } from "@/lib/utils/business-logic-server";
import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations/schemas";

export async function GET(
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

  // Security check: Only owner or admin can view detail
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (data.booked_by !== user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  // Server-side validation
  const validation = bookingSchema.partial().safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 },
    );
  }

  const validatedData = validation.data;

  // Retrieve current booking to get court_id etc if not provided in partial update
  const { data: currentBooking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (!currentBooking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Check for booking conflicts if time/date/court changed
  if (
    validatedData.court_id ||
    validatedData.booking_date ||
    validatedData.start_time ||
    validatedData.end_time
  ) {
    const hasConflict = await checkBookingConflict(
      validatedData.court_id || currentBooking.court_id,
      validatedData.booking_date || currentBooking.booking_date,
      validatedData.start_time || currentBooking.start_time,
      validatedData.end_time || currentBooking.end_time,
      id,
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 },
      );
    }
  }

  const updateData: Record<string, unknown> = {
    ...validatedData,
    updated_at: new Date().toISOString(),
  };

  // Only update status if provided in body (partial doesn't include it by default in bookingSchema but we can handle)
  if (body.status) {
    updateData.status = body.status;
  }

  // Handle user_id redirect to booked_by
  if (validatedData.user_id) {
    updateData.booked_by = validatedData.user_id;
    delete updateData.user_id;
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
