import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import CourtSubmissionForm from "@/components/courts/court-submission-form";

export default async function AdminEditCourtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: court } = await supabase
    .from("courts")
    .select("*")
    .eq("id", id)
    .single();

  if (!court) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Court</h1>
        <p className="text-muted-foreground">Update details for {court.name}</p>
      </div>
      <CourtSubmissionForm
        mode="edit"
        courtId={id}
        initialData={court}
        isAdmin={true}
      />
    </div>
  );
}
