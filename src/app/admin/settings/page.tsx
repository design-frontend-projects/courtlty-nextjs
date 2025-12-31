import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile for notification preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and account settings.
        </p>
      </div>
      <SettingsClient
        userId={user.id}
        initialPreferences={
          (profile?.notification_preferences as Record<string, boolean>) || {}
        }
      />
    </div>
  );
}
