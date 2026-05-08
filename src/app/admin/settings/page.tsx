import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getServerI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shell/page-shell";
import SettingsClient from "./settings-client";

export default async function AdminSettingsPage() {
  const { t } = await getServerI18n();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("auth.users")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow={t("admin.settings.page.eyebrow", "Admin settings")}
        title={t("admin.settings.page.title", "Tune the operator environment.")}
        description={t("admin.settings.page.description", "Adjust notifications, appearance, privacy, and other preferences without leaving the admin shell.")}
      />
      <SettingsClient
        userId={user.id}
        initialPreferences={
          (profile?.notification_preferences as Record<string, boolean>) || {}
        }
      />
    </div>
  );
}
