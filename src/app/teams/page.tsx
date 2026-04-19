import Link from "next/link";
import { LayoutDashboard, Plus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  ActionRail,
  EmptyState,
  PageHeader,
  SectionShell,
  WorkspaceShell,
} from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TeamRecord = {
  id: string;
  name: string;
  sport: string;
  description: string | null;
  rating: number;
  max_players: number;
  looking_for_players: boolean;
  players_needed: number;
  team_members?: { length: number };
  profiles?: { full_name?: string | null } | null;
};

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase.from("teams").select("*");

  return (
    <WorkspaceShell>
      <PageHeader
        eyebrow="Team directory"
        title="Find the right squad."
        description="Browse active teams, check recruiting status, and jump into the team workspace when a fit looks right."
        actions={
          <ActionRail>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">
                <LayoutDashboard data-icon="inline-start" />
                Dashboard
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/teams/create">
                <Plus data-icon="inline-start" />
                Create team
              </Link>
            </Button>
          </ActionRail>
        }
      />

      <SectionShell title="Directory filters" description="Current filters are visual only in this pass, but the shell is aligned with the rest of the workspace.">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="section-kicker text-[0.68rem]">Sport</span>
            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-44 rounded-full">
                <SelectValue placeholder="All sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sports</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="volleyball">Volleyball</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="looking" />
            <label htmlFor="looking" className="text-sm text-muted-foreground">
              Show only teams recruiting right now
            </label>
          </div>
        </div>
      </SectionShell>

      {teams && teams.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(teams as TeamRecord[]).map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="group">
              <div className="surface-panel h-full rounded-[2rem] px-5 py-5 transition-transform duration-200 group-hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex size-14 items-center justify-center rounded-[1.3rem] border border-primary/15 bg-primary/10 font-display text-2xl font-semibold text-primary">
                      {team.name.charAt(0)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-3xl font-semibold tracking-tight">{team.name}</h2>
                        <Badge variant="secondary" className="rounded-full capitalize">
                          {team.sport}
                        </Badge>
                      </div>
                      {team.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{team.description}</p>
                      ) : (
                        <p className="text-sm leading-6 text-muted-foreground">Team profile ready for players, schedules, and chat.</p>
                      )}
                    </div>
                  </div>
                  {team.looking_for_players ? (
                    <Badge className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Recruiting
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    {(team.team_members?.length || 0).toString()} / {team.max_players} players
                  </div>
                  {team.players_needed ? <span>{team.players_needed} spots open</span> : <span>Roster stable</span>}
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Users}
          title="No teams available yet"
          description="Create the first team and start building the roster, approvals, and session planning flow."
          action={
            <Button asChild className="rounded-full px-6">
              <Link href="/teams/create">Create the first team</Link>
            </Button>
          }
        />
      )}
    </WorkspaceShell>
  );
}
