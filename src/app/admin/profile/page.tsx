import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-shell";
import ProfileClient from "./profile-client";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
  }

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow="Admin profile"
        title="Keep operator identity current."
        description="Update the account details attached to approvals, bookings, notifications, and payout actions."
      />
      <ProfileClient initialProfile={profile} userEmail={user.email || ""} />
    </div>
  );
}
