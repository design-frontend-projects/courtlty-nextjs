import { createClient } from "@/lib/supabase/server";

/**
 * Check if a booking conflicts with existing bookings
 */
export async function checkBookingConflict(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", courtId)
    .eq("booking_date", date)
    .neq("status", "cancelled")
    .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

  if (error) {
    console.error("Error checking booking conflict:", error);
    return true; // Assume conflict on error for safety
  }

  if (excludeBookingId) {
    return data.some((booking) => booking.id !== excludeBookingId);
  }

  return data.length > 0;
}

/**
 * Check if user can create a team (one team per user rule)
 */
export async function canCreateTeam(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error checking team ownership:", error);
    return false;
  }

  return !data; // Can create if no team found
}
