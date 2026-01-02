import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, LayoutDashboard, Star, Users } from "lucide-react";

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase.from("teams").select("*");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                Browse Teams
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover your next squad or lead your own to victory.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="default" size="lg" className="shadow-xs">
                <Link href="/teams/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Team
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Sport:</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="volleyball">Volleyball</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-8" />

            <div className="flex items-center space-x-2">
              <Checkbox id="looking" />
              <label
                htmlFor="looking"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Looking for players
              </label>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team: any) => (
              <Link key={team.id} href={`/teams/${team.id}`} className="group">
                <Card className="h-full overflow-hidden border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="relative h-40 p-0 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-blue-500 to-emerald-400 opacity-90 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/5 backdrop-blur-[2px]">
                      <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-xl ring-4 ring-black/5">
                        <AvatarImage src={team.logo_url} alt={team.name} />
                        <AvatarFallback className="text-3xl font-bold bg-white text-slate-900">
                          {team.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <CardTitle className="text-2xl font-bold mb-1 text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {team.name}
                        </CardTitle>
                        <Badge variant="secondary" className="font-medium">
                          {team.sport?.charAt(0).toUpperCase() +
                            team.sport?.slice(1)}
                        </Badge>
                      </div>
                      {team.rating > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full border border-yellow-200 dark:border-yellow-800">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                            {team.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {team.description && (
                      <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 min-h-10">
                        {team.description}
                      </CardDescription>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            <span className="text-slate-900 dark:text-slate-50 font-bold">
                              {team.team_members?.length || 0}
                            </span>
                            <span className="mx-0.5">/</span>
                            {team.max_players} players
                          </span>
                        </div>
                        {team.looking_for_players && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-800">
                            Hiring
                          </Badge>
                        )}
                      </div>

                      {team.looking_for_players && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                          <p className="text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Looking for {team.players_needed} player(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-900 shadow-sm">
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-[10px] text-white font-bold">
                          {team.profiles?.full_name?.charAt(0) || "O"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-[11px]">
                        <p className="text-muted-foreground leading-none mb-1">
                          Owner
                        </p>
                        <p className="font-bold text-slate-900 dark:text-slate-50 leading-none">
                          {team.profiles?.full_name || "Team Owner"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800"
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              No Teams Found
            </h2>
            <p className="text-muted-foreground text-center max-w-sm mb-8">
              Be the pioneer! Start your own journey and build your dream team
              today.
            </p>
            <Button asChild size="lg" className="px-10">
              <Link href="/teams/create">Create Sample Team</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
