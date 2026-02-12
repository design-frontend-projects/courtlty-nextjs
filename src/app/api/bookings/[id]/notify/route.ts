import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Get message from body
  const body = await request.json();
  const { message } = body;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // 4. Fetch booking details to find recipients
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("booked_by, team_id")
    .eq("id", id)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const recipientIds: string[] = [];

  // 5. Determine recipients
  if (booking.team_id) {
    // If team booking, notify all accepted team members
    const { data: members } = await supabase
      .from("team_members")
      .select("player_id")
      .eq("team_id", booking.team_id)
      .eq("status", "accepted");

    if (members) {
      recipientIds.push(...members.map((m) => m.player_id));
    }
  } else {
    // Individual booking
    recipientIds.push(booking.booked_by);
  }

  // Unique IDs only
  const uniqueRecipients = Array.from(new Set(recipientIds));

  if (uniqueRecipients.length === 0) {
    return NextResponse.json(
      { error: "No recipients found for this booking" },
      { status: 404 },
    );
  }

  // 6. Send notification
  await sendBookingNotification(
    uniqueRecipients,
    message,
    "Admin Notification",
  );

  return NextResponse.json({
    success: true,
    recipients: uniqueRecipients.length,
  });
}
