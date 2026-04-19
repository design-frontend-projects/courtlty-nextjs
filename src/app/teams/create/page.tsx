import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionShell, WorkspaceShellTight } from "@/components/shell/page-shell";
import TeamCreationForm from "@/components/teams/team-creation-form";

export default async function CreateTeamPage() {
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
          eyebrow="Team creation"
          title="You already own a team."
          description={`Manage ${existingTeam.name} instead of opening a second owner account.`}
          actions={
            <Button asChild className="rounded-full">
              <Link href={`/teams/${existingTeam.id}`}>Open my team</Link>
            </Button>
          }
        />
      </WorkspaceShellTight>
    );
  }

  return (
    <WorkspaceShellTight>
      <PageHeader
        eyebrow="Team creation"
        title="Build the squad shell before the next session."
        description="Name the team, define the roster, and open recruitment if you still need players."
      />
      <SectionShell title="Team details" description="Everything here feeds the public team profile and owner workspace.">
        <TeamCreationForm />
      </SectionShell>
    </WorkspaceShellTight>
  );
}
