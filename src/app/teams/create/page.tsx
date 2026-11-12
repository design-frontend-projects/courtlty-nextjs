import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getServerI18n } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionShell, WorkspaceShellTight } from "@/components/shell/page-shell";
import TeamCreationForm from "@/components/teams/team-creation-form";

export default async function CreateTeamPage() {
  const { t } = await getServerI18n();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingTeam } = await supabase.from("teams").select("id, name").eq("owner_id", user.id).single();

  if (existingTeam) {
    return (
      <WorkspaceShellTight>
        <PageHeader
          eyebrow={t("teamCreation.eyebrow", "Team creation")}
          title={t("teamCreation.alreadyOwnerTitle", "You already own a team.")}
          description={t("teamCreation.alreadyOwnerDesc", "Manage {name} instead of opening a second owner account.", { name: existingTeam.name })}
          actions={
            <Button asChild className="rounded-full">
              <Link href={`/teams/${existingTeam.id}`}>{t("teamCreation.openMyTeam", "Open my team")}</Link>
            </Button>
          }
        />
      </WorkspaceShellTight>
    );
  }

  return (
    <WorkspaceShellTight>
      <PageHeader
        eyebrow={t("teamCreation.eyebrow", "Team creation")}
        title={t("teamCreation.newTeamTitle", "Build the squad shell before the next session.")}
        description={t("teamCreation.newTeamDesc", "Name the team, define the roster, and open recruitment if you still need players.")}
      />
      <SectionShell
        title={t("teamCreation.teamDetailsTitle", "Team details")}
        description={t("teamCreation.teamDetailsDesc", "Everything here feeds the public team profile and owner workspace.")}
      >
        <TeamCreationForm />
      </SectionShell>
    </WorkspaceShellTight>
  );
}
