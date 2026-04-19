import { CalendarDays, Trophy, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
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
    id?: string;
    email?: string | null;
    first_name?: string | null;
    avatar_url?: string | null;
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
        eyebrow="Team workspace"
        title={typedTeam.name}
        description={typedTeam.description || `${typedTeam.sport} team workspace for members, scheduling, and approvals.`}
        actions={
          <ActionRail>
            <Badge variant="secondary" className="rounded-full capitalize">
              {typedTeam.sport}
            </Badge>
            {!isMember && !currentMember ? (
              <form action={joinTeam}>
                <Button type="submit" className="rounded-full px-6">
                  Join team
                </Button>
              </form>
            ) : null}
            {currentMember?.status === "pending" ? (
              <Button variant="outline" className="rounded-full px-6" disabled>
                Request pending
              </Button>
            ) : null}
          </ActionRail>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <MetricTile label="Approved players" value={approvedMembers.length} icon={Users} meta="Current active roster." />
        <MetricTile label="Weekly wins" value={typedTeam.weekly_wins || 0} icon={Trophy} meta="Running win count." />
        <MetricTile label="Total games" value={typedTeam.total_games || 0} icon={CalendarDays} meta="Matches and scheduled fixtures." />
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <SectionShell title="Roster" description="Members currently approved on this squad.">
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
                    <p className="text-sm capitalize text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                {member.role === "owner" ? (
                  <Badge variant="secondary" className="rounded-full">
                    Owner
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        </SectionShell>

        <Tabs defaultValue={isMember ? "chat" : "games"} className="grid gap-5">
          <TabsList className="h-12 rounded-full bg-accent/45 p-1">
            {isMember ? <TabsTrigger value="chat" className="rounded-full">Team chat</TabsTrigger> : null}
            <TabsTrigger value="games" className="rounded-full">Upcoming games</TabsTrigger>
            {isOwner ? <TabsTrigger value="management" className="rounded-full">Management</TabsTrigger> : null}
          </TabsList>

          {isMember ? (
            <TabsContent value="chat">
              <TeamChat teamId={typedTeam.id} currentUserId={user.id} />
            </TabsContent>
          ) : null}

          <TabsContent value="games">
            <SectionShell title="Upcoming fixtures" description="Game scheduling is ready for the next phase of the product.">
              <EmptyState
                icon={CalendarDays}
                title="No upcoming games"
                description="Once matches are scheduled, the team will be able to track them here alongside roster communication."
              />
            </SectionShell>
          </TabsContent>

          {isOwner ? (
            <TabsContent value="management">
              <SectionShell title="Pending join requests" description="Approve or reject new players without leaving the team workspace.">
                <TeamMemberManagement initialPendingMembers={pendingMembers} teamId={typedTeam.id} />
              </SectionShell>
            </TabsContent>
          ) : null}
        </Tabs>
      </div>
    </WorkspaceShell>
  );
}
