import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CourtSubmissionForm from "@/components/courts/court-submission-form";

export default async function AdminNewCourtPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // if (profile?.role !== "admin") {
  //   redirect("/dashboard");
  // }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Court</h1>
        <p className="text-muted-foreground">
          Create a new court listing manually.
        </p>
      </div>
      <CourtSubmissionForm mode="create" isAdmin={true} />
    </div>
  );
}
