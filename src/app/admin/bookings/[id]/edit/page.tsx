import { createClient } from "@/lib/supabase/server";
import AdminBookingForm from "@/components/admin/bookings/admin-booking-form";
import { notFound } from "next/navigation";

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  // Fetch courts/users for dropdowns
  const { data: courts } = await supabase.from("courts").select("*");
  const { data: users } = await supabase.from("profiles").select("*");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Booking</h1>
      <AdminBookingForm
        courts={courts || []}
        users={users || []}
        initialData={booking}
        bookingId={booking.id}
        isEdit={true}
      />
    </div>
  );
}
