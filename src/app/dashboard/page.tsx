import Link from "next/link";
import { Heart, LayoutGrid, Search, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  ActionRail,
  EmptyState,
  MetricTile,
  PageHeader,
  SectionShell,
  WorkspaceShell,
} from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardBookingsClient } from "@/components/dashboard/dashboard-bookings-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: bookings }, { data: ownedTeams }, { data: memberTeams }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("bookings")
      .select(
        `
        *,
        courts (
          name,
          address,
          city,
          sports
        )
      `,
      )
      .eq("booked_by", user.id)
      .gte("booking_date", new Date().toISOString().split("T")[0])
      .order("booking_date", { ascending: true }),
    supabase
      .from("teams")
      .select(
        `
        *,
        team_members (
          id,
          profiles!team_members_player_id_fkey (
            full_name,
            avatar_url
          )
        )
      `,
      )
      .eq("owner_id", user.id),
    supabase
      .from("team_members")
      .select(
        `
        team_id,
        teams (
          *,
          team_members (
            id,
            profiles!team_members_player_id_fkey (
              full_name,
              avatar_url
            )
          )
        )
      `,
      )
      .eq("player_id", user.id),
  ]);

  const joinedTeams = memberTeams?.map((membership) => membership.teams).filter(Boolean) || [];
  const allTeams = [...(ownedTeams || [])];
  const existingTeamIds = new Set(allTeams.map((team) => team.id));

  joinedTeams.forEach((team) => {
    if (team && !existingTeamIds.has(team.id)) {
      allTeams.push(team);
      existingTeamIds.add(team.id);
    }
  });

  const latestBookings = bookings?.slice(0, 5) || [];

  return (
    <WorkspaceShell>
      <PageHeader
        eyebrow="Player workspace"
        title={`Welcome back, ${profile?.full_name?.split(" ")[0] || "Player"}.`}
        description="Keep your active bookings, squads, and next actions in one place."
        actions={
          <ActionRail>
            {profile?.role === "admin" ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin">
                  <ShieldCheck data-icon="inline-start" />
                  Admin
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/teams">
                <LayoutGrid data-icon="inline-start" />
                Teams
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/courts">
                <Search data-icon="inline-start" />
                Find courts
              </Link>
            </Button>
          </ActionRail>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardBookingsClient bookings={bookings || []} />
        <MetricTile
          label="Squad memberships"
          value={allTeams.length}
          icon={Users}
          meta="Teams you own or actively play with."
        />
        <MetricTile
          label="Saved venues"
          value={0}
          icon={Heart}
          meta="Favorites are not set up yet, but this space is reserved for quick access."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionShell
          title="Upcoming sessions"
          description="Your next confirmed and pending bookings, ordered by date."
          actions={
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/courts">Book another court</Link>
            </Button>
          }
        >
          {latestBookings.length > 0 ? (
            <div className="grid gap-3">
              {latestBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-accent/18 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{booking.courts?.name}</p>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.booking_date} at {booking.start_time} - {booking.end_time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.courts?.address}, {booking.courts?.city}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="rounded-full sm:self-center">
                    <Link href={`/courts/${booking.court_id}`}>Open court</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No sessions booked yet"
              description="Search the court directory and lock your next booking. Once a session is scheduled, it will stay visible here."
              action={
                <Button asChild className="rounded-full px-6">
                  <Link href="/courts">Search courts</Link>
                </Button>
              }
            />
          )}
        </SectionShell>

        <SectionShell
          title="My squads"
          description="Teams you currently own or belong to."
          actions={
            <Button asChild className="rounded-full">
              <Link href="/teams/create">Create team</Link>
            </Button>
          }
        >
          {allTeams.length > 0 ? (
            <div className="grid gap-4">
              {allTeams.map((team) => (
                <div key={team.id} className="surface-panel rounded-[1.6rem] px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-14 border border-border/70">
                        <AvatarFallback className="font-display bg-primary/10 text-lg font-semibold text-primary">
                          {team.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-2xl font-semibold text-foreground">{team.name}</p>
                          <Badge variant="secondary" className="rounded-full capitalize">
                            {team.sport}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(team.team_members?.length || 0).toString()} members active
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" className="rounded-full">
                      <Link href={`/teams/${team.id}`}>Open team</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No teams yet"
              description="Create your own team or join an existing squad to keep roster, chat, and session details together."
              action={
                <Button asChild className="rounded-full px-6">
                  <Link href="/teams/create">Create a team</Link>
                </Button>
              }
            />
          )}
        </SectionShell>
      </div>
    </WorkspaceShell>
  );
}
