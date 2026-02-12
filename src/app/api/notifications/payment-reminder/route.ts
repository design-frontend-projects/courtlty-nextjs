import { createClient } from "@/lib/supabase/server";
import { sendPaymentNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

import { z } from "zod";

const paymentReminderSchema = z.object({
  bookingId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input
  const body = await request.json();
  const validation = paymentReminderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  const { bookingId } = validation.data;

  // 3. Authorization check (Only owner or admin)
  const [{ data: booking }, { data: profile }] = await Promise.all([
    supabase.from("bookings").select("booked_by").eq("id", bookingId).single(),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = booking.booked_by === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "Forbidden: You cannot send reminders for this booking" },
      { status: 403 },
    );
  }

  // 4. Get Booking participants
  const { data: participants } = await supabase
    .from("match_participants")
    .select("user_id, payment_status")
    .eq("booking_id", bookingId);

  if (!participants || participants.length === 0) {
    return NextResponse.json(
      { message: "No participants found" },
      { status: 404 },
    );
  }

  // 5. Filter unpaid
  const unpaidUserIds = participants
    .filter((p) => p.payment_status === "pending")
    .map((p) => p.user_id);

  if (unpaidUserIds.length === 0) {
    return NextResponse.json({ message: "Everyone has paid." });
  }

  // 6. Get Booking details for notification text
  const { data: bookingDetails } = await supabase
    .from("bookings")
    .select("court_id, start_time, courts(name)")
    .eq("id", bookingId)
    .single();

  const matchName = bookingDetails?.courts?.[0]?.name
    ? `${bookingDetails.courts[0].name} at ${bookingDetails.start_time}`
    : "Your Match";

  // 7. Send Notifications
  await sendPaymentNotification(unpaidUserIds, matchName);

  return NextResponse.json({
    message: `Sent notifications to ${unpaidUserIds.length} users.`,
  });
}
