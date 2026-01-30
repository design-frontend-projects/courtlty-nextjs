import { createClient } from "@/lib/supabase/server";
import BookingsCalendar from "@/components/admin/bookings/bookings-calendar";
import BookingsTable from "@/components/admin/bookings/bookings-table";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch today's bookings by default for initial load
  const today = new Date().toISOString().split("T")[0];

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`*, courts (name), profiles (full_name, phone)`)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(100);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Bookings Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage court schedule and booking requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Calendar View - Takes up 2/3 space on large screens */}
        <BookingsCalendar initialBookings={bookings || []} />

        {/* Recent/Table View - Takes up 1/3 space on large screens */}
        <div className="col-span-1 border-none shadow-none bg-transparent">
          <BookingsTable initialBookings={bookings || []} />
        </div>
      </div>
    </div>
  );
}
