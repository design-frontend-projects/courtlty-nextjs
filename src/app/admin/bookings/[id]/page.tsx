import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Edit } from "lucide-react";

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
        *,
        courts (*),
        profiles (*)
    `
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <Button asChild>
          <Link href={`/admin/bookings/${id}/edit`}>
            <Edit className="w-4 h-4 mr-2" /> Edit Booking
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Booking #{booking.id.slice(0, 8)}</span>
            <Badge
              variant={booking.status === "confirmed" ? "default" : "secondary"}
            >
              {booking.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Court</h3>
              <p className="text-lg font-semibold">{booking.courts?.name}</p>
              <p className="text-sm text-gray-500">
                {booking.courts?.address}, {booking.courts?.city}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="text-lg font-semibold">
                {booking.profiles?.full_name || "Guest"}
              </p>
              <p className="text-sm text-gray-500">{booking.profiles?.email}</p>
              <p className="text-sm text-gray-500">{booking.profiles?.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="text-lg font-semibold">
                {format(new Date(booking.date), "EEEE, MMMM do, yyyy")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Time</h3>
              <p className="text-lg font-semibold">
                {booking.start_time} - {booking.end_time}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500">Financials</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Rate</span>
              <span className="font-semibold">
                ${booking.courts?.price_per_hour}/hr
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xl font-bold text-blue-600">
              <span>Total</span>
              <span>${booking.total_price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
