import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { TeamChat } from "@/components/teams/TeamChat";
import { TeamMemberManagement } from "@/components/teams/TeamMemberManagement";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Users, Trophy } from "lucide-react";

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
    .select("*, team_members(team_id,player_id, status, role, profiles(*))")
    .eq("id", id)
    .eq("team_members.team_id", id)
    .single();

  console.log("check team", team);

  if (error || !team) {
    notFound();
  }

  const currentMember = team.team_members.find(
    (m: any) => m.player_id === user.id
  );
  const isMember = currentMember?.status === "approved";
  const isOwner = currentMember?.role === "owner"; // Or check based on team.owner_id if reliable
  const pendingMembers = team.team_members.filter(
    (m: any) => m.status === "pending"
  );
  const approvedMembers = team.team_members.filter(
    (m: any) => m.status === "approved"
  );

  async function joinTeam() {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("team_members").insert({
      team_id: id,
      player_id: user.id,
      status: "pending",
      role: "member",
    });
    redirect(`/teams/${id}`);
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Team Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {team.logo_url ? (
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={team.logo_url} />
                    <AvatarFallback>{team.name[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Trophy className="w-12 h-12 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription>{team.sport} Team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {team.description || "No description provided."}
              </p>
              <div className="flex justify-around py-4 border-t border-b">
                <div className="text-center">
                  <p className="text-2xl font-bold">{team.weekly_wins || 0}</p>
                  <p className="text-xs text-muted-foreground">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{team.total_games || 0}</p>
                  <p className="text-xs text-muted-foreground">Games</p>
                </div>
              </div>

              {!isMember && !currentMember && (
                <form action={joinTeam}>
                  <Button className="w-full" size="lg">
                    Join Team
                  </Button>
                </form>
              )}
              {currentMember?.status === "pending" && (
                <Button variant="secondary" className="w-full" disabled>
                  Request Pending
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-4 h-4" /> Members ({approvedMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedMembers.map((member: any) => (
                  <div
                    key={member.player_id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback>
                        {member.profiles?.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {member.profiles?.first_name || member.profiles?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={isMember ? "chat" : "games"}>
            <TabsList className="mb-4">
              {isMember && <TabsTrigger value="chat">Team Chat</TabsTrigger>}
              <TabsTrigger value="games">Upcoming Games</TabsTrigger>
              {isOwner && (
                <TabsTrigger value="management">Management</TabsTrigger>
              )}
            </TabsList>

            {isMember && (
              <TabsContent value="chat">
                <TeamChat teamId={team.id} currentUserId={user.id} />
              </TabsContent>
            )}

            <TabsContent value="games">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Games</CardTitle>
                  <CardDescription>
                    Scheduled matches for this team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No upcoming games scheduled.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isOwner && (
              <TabsContent value="management">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                      Approve or reject users requesting to join.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamMemberManagement
                      initialPendingMembers={pendingMembers}
                      teamId={team.id}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
