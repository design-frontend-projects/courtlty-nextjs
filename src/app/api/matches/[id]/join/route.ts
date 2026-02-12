import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: booking_id } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the booking details to check max participants
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("max_participants, is_open_match")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (!booking.is_open_match) {
      return NextResponse.json(
        { error: "This booking is not an open match" },
        { status: 400 },
      );
    }

    // Check current participants count
    const { count, error: countError } = await supabase
      .from("match_participants")
      .select("*", { count: "exact", head: true })
      .eq("booking_id", booking_id)
      .eq("status", "joined");

    if (countError) {
      return NextResponse.json(
        { error: "Failed to check participant count" },
        { status: 500 },
      );
    }

    if (booking.max_participants && (count || 0) >= booking.max_participants) {
      return NextResponse.json({ error: "Match is full" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("match_participants")
      .select("status")
      .eq("booking_id", booking_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      if (existing.status === "joined") {
        return NextResponse.json({ error: "Already joined" }, { status: 400 });
      } else {
        // Re-join if previously withdrawn
        const { data: participant, error } = await supabase
          .from("match_participants")
          .update({ status: "joined", joined_at: new Date().toISOString() })
          .eq("booking_id", booking_id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json(
            { error: "Failed to rejoin match" },
            { status: 500 },
          );
        }
        return NextResponse.json(participant);
      }
    }

    // Join match
    const { data: participant, error } = await supabase
      .from("match_participants")
      .insert({
        booking_id: booking_id,
        user_id: user.id,
        status: "joined",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error joining match:", error);
      return NextResponse.json(
        { error: "Failed to join match" },
        { status: 500 },
      );
    }

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Internal Error joining match:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
