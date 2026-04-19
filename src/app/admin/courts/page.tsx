import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ActionRail, PageHeader } from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";
import AdminCourtsClient from "@/app/admin/courts/courts-client";

export default async function AdminCourtsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: courts, error } = await supabase.from("courts").select("*");

  if (error) {
    console.error("Error fetching courts:", error);
  }

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow="Admin courts"
        title="Maintain the live court inventory."
        description="Manage listing quality, update status, and jump into venue edits without leaving the operator workspace."
        actions={
          <ActionRail>
            <Button asChild className="rounded-full">
              <Link href="/admin/courts/new">
                <Plus data-icon="inline-start" />
                Add court
              </Link>
            </Button>
          </ActionRail>
        }
      />
      <AdminCourtsClient initialCourts={courts || []} />
    </div>
  );
}
