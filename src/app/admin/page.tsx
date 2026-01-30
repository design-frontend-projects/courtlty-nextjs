import { createClient } from "@/lib/supabase/server";
import BookingsCalendar from "@/components/admin/bookings/bookings-calendar";
import BookingsTable from "@/components/admin/bookings/bookings-table";
import DashboardStats from "@/components/admin/dashboard/dashboard-stats";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all bookings for stats (limited to recent/future for performance)
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `
      *,
      courts (name),
      profiles (full_name, phone)
    `,
    )
    .order("booking_date", { ascending: false }) // Get recent ones first
    .limit(500);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = (bookingsData || []) as any[];

  // Calculate Stats
  const totalRevenue = bookings.reduce(
    (acc, b) => acc + (Number(b.total_amount) || 0),
    0,
  );
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;
  // Unique active users in recent bookings
  const activeUsers = new Set(bookings.map((b) => b.booked_by)).size;
  // Unique courts
  const activeCourts = new Set(bookings.map((b) => b.court_id)).size;

  return (
    <div className="h-full flex flex-col gap-8 p-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Overview of your court performance and schedule.
        </p>
      </div>

      <DashboardStats
        totalBookings={bookings.length}
        totalRevenue={totalRevenue}
        activeCourts={activeCourts}
        pendingRequests={pendingRequests}
        activeUsers={activeUsers}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Calendar View - Takes up 2/3 space on large screens */}
        <div className="xl:col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Court Schedule</h2>
          </div>
          <BookingsCalendar initialBookings={bookings || []} />
        </div>

        {/* Recent/Table View - Takes up 1/3 space on large screens */}
        <div className="col-span-1 border-none shadow-none bg-transparent flex flex-col gap-6">
          <BookingsTable initialBookings={bookings || []} />
        </div>
      </div>
    </div>
  );
}
