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

  const [{ data: booking }, { data: courts }, { data: users }] =
    await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).single(),
      supabase
        .from("courts")
        .select("*")
        .eq("is_active", true)
        .eq("status", "approved"),
      supabase
        .from("profiles")
        .select("id, first_name, last_name, full_name, email, role")
        .order("full_name", { ascending: true }),
    ]);

  if (!booking) notFound();

  // Map booking data to form format (booked_by -> user_id)
  const initialData = {
    court_id: booking.court_id,
    user_id: booking.booked_by,
    booking_date: booking.booking_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    sport: booking.sport || "",
    status: booking.status,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Booking</h1>
      <AdminBookingForm
        courts={courts || []}
        users={users || []}
        initialData={initialData}
        bookingId={booking.id}
        isEdit={true}
      />
    </div>
  );
}
