import { CalendarDays, Trophy, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamChat } from "@/components/teams/TeamChat";
import { TeamMemberManagement } from "@/components/teams/TeamMemberManagement";

type TeamMemberRecord = {
  id: string;
  player_id: string;
  status: string;
  role: string;
  profiles: {
    id: string;
    email: string | null;
    first_name: string | null;
    avatar_url: string | null;
  } | null;
};

type TeamRecord = {
  id: string;
  name: string;
  sport: string;
  description?: string | null;
  weekly_wins?: number | null;
  total_games?: number | null;
  logo_url?: string | null;
  team_members: TeamMemberRecord[];
};

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getServerI18n();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/teams/${id}`);
  }

  const { data: team, error } = await supabase
    .from("teams")
    .select("*, team_members(id, player_id, status, role, profiles(*))")
    .eq("id", id)
    .single();

  if (error || !team) {
    notFound();
  }

  const typedTeam = team as TeamRecord;
  const currentMember = typedTeam.team_members.find((member) => member.player_id === user.id);
  const isMember = currentMember?.status === "approved";
  const isOwner = currentMember?.role === "owner";
  const pendingMembers = typedTeam.team_members.filter((member) => member.status === "pending");
  const approvedMembers = typedTeam.team_members.filter((member) => member.status === "approved");

  async function joinTeam() {
    "use server";
    const supabaseServer = await createClient();
    const {
      data: { user: activeUser },
    } = await supabaseServer.auth.getUser();
    if (!activeUser) return;

    await supabaseServer.from("team_members").insert({
      team_id: id,
      player_id: activeUser.id,
      status: "pending",
      role: "member",
    });
    redirect(`/teams/${id}`);
  }

  return (
    <WorkspaceShell>
      <PageHeader
        eyebrow={t("teamWorkspace.eyebrow", "Team workspace")}
        title={typedTeam.name}
        description={
          typedTeam.description ||
          t("teamWorkspace.defaultDesc", "{sport} team workspace for members, scheduling, and approvals.", {
            sport: t(`common.sports.${typedTeam.sport.toLowerCase()}`, typedTeam.sport),
          })
        }
        actions={
          <ActionRail>
            <Badge variant="secondary" className="rounded-full capitalize">
              {t(`common.sports.${typedTeam.sport.toLowerCase()}`, typedTeam.sport)}
            </Badge>
            {!isMember && !currentMember ? (
              <form action={joinTeam}>
                <Button type="submit" className="rounded-full px-6">
                  {t("teamWorkspace.joinTeam", "Join team")}
                </Button>
              </form>
            ) : null}
            {currentMember?.status === "pending" ? (
              <Button variant="outline" className="rounded-full px-6" disabled>
                {t("teamWorkspace.requestPending", "Request pending")}
              </Button>
            ) : null}
          </ActionRail>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <MetricTile
          label={t("teamWorkspace.metrics.approvedPlayers", "Approved players")}
          value={approvedMembers.length}
          icon={Users}
          meta={t("teamWorkspace.metrics.approvedPlayersMeta", "Current active roster.")}
        />
        <MetricTile
          label={t("teamWorkspace.metrics.weeklyWins", "Weekly wins")}
          value={typedTeam.weekly_wins || 0}
          icon={Trophy}
          meta={t("teamWorkspace.metrics.weeklyWinsMeta", "Running win count.")}
        />
        <MetricTile
          label={t("teamWorkspace.metrics.totalGames", "Total games")}
          value={typedTeam.total_games || 0}
          icon={CalendarDays}
          meta={t("teamWorkspace.metrics.totalGamesMeta", "Matches and scheduled fixtures.")}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <SectionShell
          title={t("teamWorkspace.roster.title", "Roster")}
          description={t("teamWorkspace.roster.description", "Members currently approved on this squad.")}
        >
          <div className="grid gap-3">
            {approvedMembers.map((member) => (
              <div
                key={member.player_id}
                className="flex items-center justify-between rounded-[1.45rem] border border-border/70 bg-accent/18 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 border border-border/70">
                    <AvatarImage src={member.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{member.profiles?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {member.profiles?.first_name || member.profiles?.email || "Player"}
                    </p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {member.role === "owner"
                        ? t("teamWorkspace.roster.owner", "Owner")
                        : t("teamWorkspace.roster.member", "Member")}
                    </p>
                  </div>
                </div>
                {member.role === "owner" ? (
                  <Badge variant="secondary" className="rounded-full">
                    {t("teamWorkspace.roster.owner", "Owner")}
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        </SectionShell>

        <Tabs defaultValue={isMember ? "chat" : "games"} className="grid gap-5">
          <TabsList className="h-12 rounded-full bg-accent/45 p-1">
            {isMember ? (
              <TabsTrigger value="chat" className="rounded-full">
                {t("teamWorkspace.tabs.teamChat", "Team chat")}
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="games" className="rounded-full">
              {t("teamWorkspace.tabs.upcomingGames", "Upcoming games")}
            </TabsTrigger>
            {isOwner ? (
              <TabsTrigger value="management" className="rounded-full">
                {t("teamWorkspace.tabs.management", "Management")}
              </TabsTrigger>
            ) : null}
          </TabsList>

          {isMember ? (
            <TabsContent value="chat">
              <TeamChat teamId={typedTeam.id} currentUserId={user.id} />
            </TabsContent>
          ) : null}

          <TabsContent value="games">
            <SectionShell
              title={t("teamWorkspace.fixtures.title", "Upcoming fixtures")}
              description={t("teamWorkspace.fixtures.description", "Game scheduling is ready for the next phase of the product.")}
            >
              <EmptyState
                icon={CalendarDays}
                title={t("teamWorkspace.fixtures.emptyTitle", "No upcoming games")}
                description={t("teamWorkspace.fixtures.emptyDesc", "Once matches are scheduled, the team will be able to track them here alongside roster communication.")}
              />
            </SectionShell>
          </TabsContent>

          {isOwner ? (
            <TabsContent value="management">
              <SectionShell
                title={t("teamWorkspace.managementSection.title", "Pending join requests")}
                description={t("teamWorkspace.managementSection.description", "Approve or reject new players without leaving the team workspace.")}
              >
                <TeamMemberManagement initialPendingMembers={pendingMembers} teamId={typedTeam.id} />
              </SectionShell>
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    </WorkspaceShell>
  );
}
