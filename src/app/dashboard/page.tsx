import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Users,
  Heart,
  Plus,
  ArrowRight,
  ShieldCheck,
  Search,
  LayoutGrid,
} from "lucide-react";
import { DashboardBookingsClient } from "@/components/dashboard/dashboard-bookings-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all user's upcoming bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      courts (
        name,
        address,
        city
      )
    `
    )
    .eq("booked_by", user.id)
    .gte("booking_date", new Date().toISOString().split("T")[0])
    .order("booking_date", { ascending: true });

  // Fetch all teams user belongs to (as owner or member)
  // First get teams where user is owner
  const { data: ownedTeams } = await supabase
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
    `
    )
    .eq("owner_id", user.id);

  // Get teams where user is a member
  const { data: memberTeams } = await supabase
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
       `
    )
    .eq("player_id", user.id);

  // Combine teams
  // Combine teams
  const joinedTeams = memberTeams?.map((mt) => mt.teams) || [];
  // Filter out any duplicates if user is owner and also in team_members (unlikely but safe)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTeams: any[] = [...(ownedTeams || [])];
  // Create a Set of existing team IDs for O(1) lookups
  const existingTeamIds = new Set(allTeams.map((t) => t.id));

  joinedTeams.forEach((jt) => {
    // @ts-expect-error - Supabase join types are complex
    if (jt && !existingTeamIds.has(jt.id)) {
      allTeams.push(jt);
      existingTeamIds.add(jt.id);
    }
  });

  const latestBookings = bookings?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Player"}!
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                Ready for your next match?
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {profile?.role === "admin" && (
                <Button
                  asChild
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 border-purple-200 dark:border-purple-800"
                >
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="default"
                className="shadow-lg shadow-blue-500/20"
              >
                <Link href="/courts">
                  <Search className="mr-2 h-4 w-4" />
                  Find Courts
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/teams">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Browse Teams
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Booking Stats Card with Modal */}
            <DashboardBookingsClient bookings={bookings || []} />

            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  My Teams
                </CardTitle>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-50">
                  {allTeams.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active squad memberships
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Favorite Courts
                </CardTitle>
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                  <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-50">
                  0
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Quick access to top picks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Bookings List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1">
              <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  Latest Bookings
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Link href="/courts">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {latestBookings && latestBookings.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {latestBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 font-bold shrink-0">
                              <span className="text-[10px] leading-none uppercase">
                                {new Date(booking.booking_date).toLocaleString(
                                  "default",
                                  { month: "short" }
                                )}
                              </span>
                              <span className="text-lg leading-none">
                                {new Date(booking.booking_date).getDate()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors">
                                {booking.courts?.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.courts?.address},{" "}
                                {booking.courts?.city}
                              </p>
                              <p className="text-xs font-medium text-slate-500 mt-1">
                                {booking.start_time} - {booking.end_time}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="capitalize bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium italic">
                      No matches scheduled for now.
                    </p>
                    <Button asChild variant="link" size="sm" className="mt-2">
                      <Link href="/courts">Book your favorite court now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Team Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit">
              <CardHeader className="bg-linear-to-br from-indigo-600 to-blue-500 text-white pb-8">
                <CardTitle className="text-xl font-bold">My Teams</CardTitle>
                <CardDescription className="text-indigo-100">
                  {allTeams.length > 0
                    ? "Manage your squads"
                    : "Join or create a team"}
                </CardDescription>
              </CardHeader>
              <CardContent className="-mt-6">
                {allTeams.length > 0 ? (
                  <div className="space-y-6">
                    {allTeams.map((team: any) => (
                      <div key={team.id} className="space-y-4 mb-6 last:mb-0">
                        <Card className="border-white/20 shadow-xl bg-white dark:bg-slate-900 p-6 text-center">
                          <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-slate-50 dark:border-slate-800 shadow-lg">
                            <AvatarFallback className="bg-linear-to-r from-blue-500 to-emerald-500 text-white text-2xl font-black">
                              {team.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-black text-slate-900 dark:text-slate-50">
                            {team.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-2 capitalize"
                          >
                            {team.sport}
                          </Badge>
                          <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">
                              Members
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">
                              {team.team_members?.length || 0} /{" "}
                              {team.max_players}
                            </span>
                          </div>
                          <Separator className="my-4 bg-slate-100 dark:bg-slate-800" />

                          <Button
                            asChild
                            variant="default"
                            className="w-full font-bold group"
                          >
                            <Link href={`/teams/${team.id}`}>
                              Manage Squad
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-100 dark:border-slate-800 text-center shadow-lg transform -translate-y-2">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Plus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-2">
                      Build Your Legacy
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create a team and invite your friends to start competing.
                    </p>
                    <Button
                      asChild
                      className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 shadow-lg"
                    >
                      <Link href="/teams/create">Create New Team</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
