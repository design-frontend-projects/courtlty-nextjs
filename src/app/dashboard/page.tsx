import Link from "next/link";
import { Heart, LayoutGrid, Search, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getServerI18n } from "@/lib/i18n/server";
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
  const { t } = await getServerI18n();
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

  const joinedTeams =
    memberTeams
      ?.flatMap((membership) => {
        const teams = membership.teams as unknown;
        if (!teams) {
          return [];
        }
        return Array.isArray(teams) ? teams : [teams];
      })
      .filter((team): team is { id: string; name: string; sport: string; team_members?: { length: number } } => {
        return typeof team === "object" && team !== null && "id" in team;
      }) || [];
  const allTeams = [...((ownedTeams as typeof joinedTeams) || [])];
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
        eyebrow={t("dashboard.eyebrow", "Player workspace")}
        title={t("dashboard.welcomeBack", `Welcome back, ${profile?.full_name?.split(" ")[0] || "Player"}.`, {
          name: profile?.full_name?.split(" ")[0] || "Player",
        })}
        description={t("dashboard.description", "Keep your active bookings, squads, and next actions in one place.")}
        actions={
          <ActionRail>
            {profile?.role === "admin" ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin">
                  <ShieldCheck data-icon="inline-start" />
                  {t("dashboard.actions.admin", "Admin")}
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/teams">
                <LayoutGrid data-icon="inline-start" />
                {t("dashboard.actions.teams", "Teams")}
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/courts">
                <Search data-icon="inline-start" />
                {t("dashboard.actions.findCourts", "Find courts")}
              </Link>
            </Button>
          </ActionRail>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardBookingsClient bookings={bookings || []} />
        <MetricTile
          label={t("dashboard.metrics.squadMemberships", "Squad memberships")}
          value={allTeams.length}
          icon={Users}
          meta={t("dashboard.metrics.squadMembershipsMeta", "Teams you own or actively play with.")}
        />
        <MetricTile
          label={t("dashboard.metrics.savedVenues", "Saved venues")}
          value={0}
          icon={Heart}
          meta={t("dashboard.metrics.savedVenuesMeta", "Favorites are not set up yet, but this space is reserved for quick access.")}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionShell
          title={t("dashboard.upcomingSessions.title", "Upcoming sessions")}
          description={t("dashboard.upcomingSessions.description", "Your next confirmed and pending bookings, ordered by date.")}
          actions={
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/courts">{t("dashboard.upcomingSessions.bookAnother", "Book another court")}</Link>
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
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{booking.courts?.name}</p>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {t(`common.${booking.status}`, booking.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.booking_date} {t("dashboard.upcomingSessions.at", "at")} {booking.start_time} - {booking.end_time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.courts?.address}, {booking.courts?.city}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="rounded-full sm:self-center">
                    <Link href={`/courts/${booking.court_id}`}>{t("courts.card.viewCourt", "Open court")}</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title={t("dashboard.upcomingSessions.emptyTitle", "No sessions booked yet")}
              description={t("dashboard.upcomingSessions.emptyDescription", "Search the court directory and lock your next booking. Once a session is scheduled, it will stay visible here.")}
              action={
                <Button asChild className="rounded-full px-6">
                  <Link href="/courts">{t("courts.empty.resetSearch", "Search courts")}</Link>
                </Button>
              }
            />
          )}
        </SectionShell>

        <SectionShell
          title={t("dashboard.teamsSection.title", "My squads")}
          description={t("dashboard.teamsSection.description", "Teams you currently own or belong to.")}
          actions={
            <Button asChild className="rounded-full">
              <Link href="/teams/create">{t("dashboard.teamsSection.createTeam", "Create team")}</Link>
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
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-2xl font-semibold text-foreground">{team.name}</p>
                          <Badge variant="secondary" className="rounded-full capitalize">
                            {t(`common.sports.${team.sport.toLowerCase()}`, team.sport)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(team.team_members?.length || 0).toString()} {t("dashboard.teamsSection.players", "players")}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" className="rounded-full">
                      <Link href={`/teams/${team.id}`}>{t("teams.eyebrow", "Open team")}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title={t("dashboard.teamsSection.emptyTitle", "No teams yet")}
              description={t("dashboard.teamsSection.emptyDescription", "Create your own team or join an existing squad to keep roster, chat, and session details together.")}
              action={
                <Button asChild className="rounded-full px-6">
                  <Link href="/teams/create">{t("dashboard.teamsSection.createTeam", "Create a team")}</Link>
                </Button>
              }
            />
          )}
        </SectionShell>
      </div>
    </WorkspaceShell>
  );
}
