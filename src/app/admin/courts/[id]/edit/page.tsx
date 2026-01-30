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

  // Fetch court with related data
  const { data: court } = await supabase
    .from("courts")
    .select(
      `
      *,
      court_images (
        id, court_id, url, is_primary, display_order, created_at
      ),
      court_availability (
        id, court_id, day_of_week, start_time, end_time, is_available
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!court) {
    notFound();
  }

  // Extract related data
  const courtImages = court.court_images || [];
  const courtAvailability = court.court_availability || [];

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
        initialImages={courtImages}
        initialAvailability={courtAvailability}
        isAdmin={true}
      />
    </div>
  );
}
