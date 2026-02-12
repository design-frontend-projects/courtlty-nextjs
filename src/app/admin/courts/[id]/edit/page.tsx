import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import CourtSubmissionForm from "@/components/courts/court-submission-form";
import { Court, CourtImage, CourtAvailability } from "@/types";

interface AdminEditCourtData extends Court {
  court_images: CourtImage[];
  court_availability: CourtAvailability[];
}

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

  // Fetch court with related data, selecting specific fields
  const { data: courtRaw, error } = await supabase
    .from("courts")
    .select(
      `
      id,
      name,
      description,
      address,
      city,
      price_per_hour,
      sports,
      amenities,
      payment_methods,
      status,
      is_active,
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

  if (error || !courtRaw) {
    if (error) console.error("Admin court fetch error:", error);
    notFound();
  }

  const court = courtRaw as unknown as AdminEditCourtData;

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
