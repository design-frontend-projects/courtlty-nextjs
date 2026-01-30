import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-[20px] bg-white border-none shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Revenue
          </CardTitle>
          <div className="p-2 bg-emerald-50 rounded-xl">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
            +20.1% from last month
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] bg-white border-none shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Bookings
          </CardTitle>
          <div className="p-2 bg-blue-50 rounded-xl">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {totalBookings}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeCourts} courts active
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] bg-white border-none shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Pending Requests
          </CardTitle>
          <div className="p-2 bg-amber-50 rounded-xl">
            <ActivityIcon className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {pendingRequests}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requires attention
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] bg-white border-none shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Active Users
          </CardTitle>
          <div className="p-2 bg-violet-50 rounded-xl">
            <Users className="h-4 w-4 text-violet-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active in recent bookings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
