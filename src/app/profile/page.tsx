import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilePageClient from "./profile-client";
import { Profile } from "@/types";

export const metadata: Metadata = {
  title: "My Profile | Courtly",
  description:
    "Manage your Courtly profile, view your teams, bookings, and update your personal information.",
  robots: {
    index: false,
    follow: false,
  },
};

interface TeamMembershipRow {
  id: string;
  role: string;
  status: string;
  team: {
    id: string;
    name: string;
    sport: string;
    logo_url: string | null;
  } | null;
}

interface BookingRow {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  sport: string;
  court: {
    id: string;
    name: string;
    address: string | null;
  } | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's teams - cast the result properly
  const { data: teamMembershipsRaw } = await supabase
    .from("team_members")
    .select(
      `
      id,
      role,
      status,
      team:teams (
        id,
        name,
        sport,
        logo_url
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "approved");

  // Fetch user's recent bookings - cast the result properly
  const { data: recentBookingsRaw } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      start_time,
      end_time,
      status,
      sport,
      court:courts (
        id,
        name,
        address
      )
    `,
    )
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .limit(5);

  // Transform the data to handle Supabase's array wrapping for single relations
  const teamMemberships = (teamMembershipsRaw || []).map((item) => {
    const rawItem = item as unknown as {
      id: string;
      role: string;
      status: string;
      team: unknown;
    };
    const teamData = Array.isArray(rawItem.team)
      ? rawItem.team[0]
      : rawItem.team;
    return {
      id: rawItem.id,
      role: rawItem.role,
      status: rawItem.status,
      team: teamData as TeamMembershipRow["team"],
    };
  }) as TeamMembershipRow[];

  const recentBookings = (recentBookingsRaw || []).map((item) => {
    const rawItem = item as unknown as {
      id: string;
      booking_date: string;
      start_time: string;
      end_time: string;
      status: string;
      sport: string;
      court: unknown;
    };
    const courtData = Array.isArray(rawItem.court)
      ? rawItem.court[0]
      : rawItem.court;
    return {
      id: rawItem.id,
      booking_date: rawItem.booking_date,
      start_time: rawItem.start_time,
      end_time: rawItem.end_time,
      status: rawItem.status,
      sport: rawItem.sport,
      court: courtData as BookingRow["court"],
    };
  }) as BookingRow[];

  return (
    <ProfilePageClient
      user={user}
      profile={profile as Profile | null}
      teams={teamMemberships}
      recentBookings={recentBookings}
    />
  );
}
