import { createClient } from "@/lib/supabase/server";
import { canCreateTeam } from "@/lib/utils/business-logic-server";
import { getMaxPlayersForSport } from "@/lib/utils/business-logic";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const lookingForPlayers = searchParams.get("looking_for_players");

  const supabase = await createClient();

  let query = supabase.from("teams").select(`
      *,
      profiles!teams_owner_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      team_members (
        id,
        player_id,
        role,
        profiles!team_members_player_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `);

  if (sport) {
    query = query.eq("sport", sport);
  }

  if (lookingForPlayers === "true") {
    query = query.eq("looking_for_players", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ teams: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user can create a team
  const canCreate = await canCreateTeam(user.id);

  if (!canCreate) {
    return NextResponse.json(
      { error: "You can only own one team at a time" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, sport, description, logo_url, max_players } = body;

  // Validate max players for sport
  const maxAllowed = getMaxPlayersForSport(sport);
  if (max_players > maxAllowed) {
    return NextResponse.json(
      { error: `Maximum ${maxAllowed} players allowed for ${sport}` },
      { status: 400 }
    );
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      name,
      sport,
      description,
      logo_url,
      max_players,
      owner_id: user.id,
    })
    .select()
    .single();

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  // Add owner as team member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    player_id: user.id,
    role: "owner",
  });

  if (memberError) {
    // Rollback team creation
    await supabase.from("teams").delete().eq("id", team.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ team }, { status: 201 });
}
