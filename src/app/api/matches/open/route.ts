import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch upcoming open matches
    // Open matches are bookings with is_open_match = true
    const { data: matches, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        end_time,
        total_amount,
        sport,
        status,
        match_title,
        max_participants,
        created_at,
        courts (
          id,
          name,
          city,
          images
        ),
        match_participants (
          count
        )
      `,
      )
      .eq("is_open_match", true)
      .gte("booking_date", new Date().toISOString().split("T")[0]) // Upcoming only
      .neq("status", "cancelled")
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Supabase Error fetching open matches:", error);
      return NextResponse.json(
        { error: "Failed to fetch open matches" },
        { status: 500 },
      );
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Internal Error fetching open matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
