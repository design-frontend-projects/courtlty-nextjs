import Link from "next/link";
import { LayoutDashboard, Plus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getServerI18n } from "@/lib/i18n/server";
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
  const { t } = await getServerI18n();
  const supabase = await createClient();
  const { data: teams } = await supabase.from("teams").select("*");

  return (
    <WorkspaceShell>
      <PageHeader
        eyebrow={t("teams.eyebrow", "Team directory")}
        title={t("teams.title", "Find the right squad.")}
        description={t("teams.description", "Browse active teams, check recruiting status, and jump into the team workspace when a fit looks right.")}
        actions={
          <ActionRail>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">
                <LayoutDashboard data-icon="inline-start" />
                {t("teams.actions.dashboard", "Dashboard")}
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/teams/create">
                <Plus data-icon="inline-start" />
                {t("teams.actions.createTeam", "Create team")}
              </Link>
            </Button>
          </ActionRail>
        }
      />

      <SectionShell
        title={t("teams.filters.title", "Directory filters")}
        description={t("teams.filters.description", "Search and filter through teams looking for active teammates.")}
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="section-kicker text-[0.68rem]">{t("teams.filters.sport", "Sport")}</span>
            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-44 rounded-full">
                <SelectValue placeholder={t("teams.filters.allSports", "All sports")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("teams.filters.allSports", "All sports")}</SelectItem>
                <SelectItem value="basketball">{t("common.sports.basketball", "Basketball")}</SelectItem>
                <SelectItem value="football">{t("common.sports.football", "Football")}</SelectItem>
                <SelectItem value="tennis">{t("common.sports.tennis", "Tennis")}</SelectItem>
                <SelectItem value="volleyball">{t("common.sports.volleyball", "Volleyball")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="looking" />
            <label htmlFor="looking" className="text-sm text-muted-foreground">
              {t("teams.filters.onlyRecruiting", "Show only teams recruiting right now")}
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
                  <div className="flex flex-col gap-3">
                    <div className="flex size-14 items-center justify-center rounded-[1.3rem] border border-primary/15 bg-primary/10 font-display text-2xl font-semibold text-primary">
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-3xl font-semibold tracking-tight">{team.name}</h2>
                        <Badge variant="secondary" className="rounded-full capitalize">
                          {t(`common.sports.${team.sport.toLowerCase()}`, team.sport)}
                        </Badge>
                      </div>
                      {team.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{team.description}</p>
                      ) : (
                        <p className="text-sm leading-6 text-muted-foreground">
                          {t("teams.card.defaultDesc", "Team profile ready for players, schedules, and chat.")}
                        </p>
                      )}
                    </div>
                  </div>
                  {team.looking_for_players ? (
                    <Badge variant="success" className="rounded-full">
                      {t("teams.card.recruiting", "Recruiting")}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    {t("teams.card.playersCount", `${team.team_members?.length || 0} / ${team.max_players} players`, {
                      count: team.team_members?.length || 0,
                      max: team.max_players,
                    })}
                  </div>
                  {team.players_needed ? (
                    <span>
                      {t("teams.card.spotsOpen", `${team.players_needed} spots open`, { count: team.players_needed })}
                    </span>
                  ) : (
                    <span>{t("teams.card.rosterStable", "Roster stable")}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Users}
          title={t("teams.empty.title", "No teams available yet")}
          description={t("teams.empty.description", "Create the first team and start building the roster, approvals, and session planning flow.")}
          action={
            <Button asChild className="rounded-full px-6">
              <Link href="/teams/create">{t("teams.empty.createFirst", "Create the first team")}</Link>
            </Button>
          }
        />
      )}
    </WorkspaceShell>
  );
}
