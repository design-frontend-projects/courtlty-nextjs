import { createClient } from "@/lib/supabase/server";
import { sendPaymentNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { bookingId } = await request.json();
  const supabase = await createClient();

  // 1. Get Booking participants
  const { data: participants } = await supabase
    .from("match_participants")
    .select("user_id, payment_status")
    .eq("booking_id", bookingId);

  if (!participants) {
    return NextResponse.json(
      { message: "No participants found" },
      { status: 404 }
    );
  }

  // 2. Filter unpaid
  const unpaidUserIds = participants
    .filter((p) => p.payment_status === "pending")
    .map((p) => p.user_id);

  if (unpaidUserIds.length === 0) {
    return NextResponse.json({ message: "Everyone has paid." });
  }

  // 3. Get Booking details for notification text
  const { data: booking } = await supabase
    .from("bookings")
    .select("court_id, start_time, courts(name)")
    .eq("id", bookingId)
    .single();

  const matchName = booking?.courts?.[0]?.name
    ? `${booking.courts[0].name} at ${booking.start_time}`
    : "Your Match";

  // 4. Send Notifications
  await sendPaymentNotification(unpaidUserIds, matchName);

  return NextResponse.json({
    message: `Sent notifications to ${unpaidUserIds.length} users.`,
  });
}
