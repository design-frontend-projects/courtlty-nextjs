import { createClient } from "@/lib/supabase/server";
import AdminBookingForm from "@/components/admin/bookings/admin-booking-form";

export default async function CreateBookingPage() {
  const supabase = await createClient();

  // Fetch courts
  const { data: courts } = await supabase.from("courts").select("*");
  const { data: users } = await supabase.from("auth.users").select("*");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Booking</h1>
      <AdminBookingForm courts={courts || []} users={users || []} />
    </div>
  );
}
