import Link from "next/link";
import { ArrowRight, LayoutDashboard, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  ActionRail,
  PageHeader,
} from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";
import BookingsCalendar from "@/components/admin/bookings/bookings-calendar";
import BookingsTable from "@/components/admin/bookings/bookings-table";
import DashboardStats from "@/components/admin/dashboard/dashboard-stats";
import { Booking, Court, Profile } from "@/types";

type AdminBooking = Booking & {
  courts: Pick<Court, "name"> | null;
  profiles: Pick<Profile, "full_name" | "phone"> | null;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `
      *,
      courts (name),
      profiles (full_name, phone)
    `,
    )
    .order("booking_date", { ascending: false })
    .limit(500);

  const bookings = (bookingsData || []) as AdminBooking[];

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (Number(booking.total_amount) || 0),
    0,
  );
  const pendingRequests = bookings.filter((booking) => booking.status === "pending").length;
  const activeUsers = new Set(bookings.map((booking) => booking.booked_by)).size;
  const activeCourts = new Set(bookings.map((booking) => booking.court_id)).size;

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow="Admin bookings"
        title="Operate the live booking floor."
        description="Monitor court sessions, confirm requests, and react to schedule changes from one high-clarity board."
        actions={
          <ActionRail>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/dashboard">
                <LayoutDashboard data-icon="inline-start" />
                Approvals
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/courts">
                Courts
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/bookings/new">
                <Plus data-icon="inline-start" />
                New booking
              </Link>
            </Button>
          </ActionRail>
        }
      />

      <DashboardStats
        totalBookings={bookings.length}
        totalRevenue={totalRevenue}
        activeCourts={activeCourts}
        pendingRequests={pendingRequests}
        activeUsers={activeUsers}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <BookingsCalendar initialBookings={bookings} />
        <BookingsTable initialBookings={bookings} />
      </div>
    </div>
  );
}
