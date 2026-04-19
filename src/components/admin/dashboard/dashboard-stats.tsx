import { CalendarDays, CircleDollarSign, Clock3, Users } from "lucide-react";

import { MetricTile } from "@/components/shell/page-shell";

interface StatsProps {
  totalBookings: number;
  totalRevenue: number;
  activeCourts: number;
  pendingRequests: number;
  activeUsers: number;
}

export default function DashboardStats({
  totalBookings,
  totalRevenue,
  activeCourts,
  pendingRequests,
  activeUsers,
}: StatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        label="Revenue tracked"
        value={`$${totalRevenue.toLocaleString()}`}
        icon={CircleDollarSign}
        meta={`${totalBookings} bookings contributing to current totals.`}
      />
      <MetricTile
        label="Active courts"
        value={activeCourts}
        icon={CalendarDays}
        meta="Venues currently represented in recent booking activity."
      />
      <MetricTile
        label="Pending requests"
        value={pendingRequests}
        icon={Clock3}
        meta="Sessions still waiting on operator confirmation."
      />
      <MetricTile
        label="Active users"
        value={activeUsers}
        icon={Users}
        meta="Unique users involved in recent booking traffic."
      />
    </section>
  );
}
