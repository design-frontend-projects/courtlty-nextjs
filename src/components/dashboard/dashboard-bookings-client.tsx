"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { BookingDetailsModal } from "./booking-details-modal";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  courts: {
    name: string;
    address: string;
    city: string;
    sports: string[];
  };
}

interface DashboardBookingsClientProps {
  bookings: Booking[];
}

export function DashboardBookingsClient({
  bookings,
}: DashboardBookingsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((booking) => {
      const sport = booking.courts?.sports?.[0] || "Other";
      counts[sport] = (counts[sport] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  return (
    <>
      <Card
        className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-md cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming Bookings
          </CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 dark:text-slate-50">
            {bookings.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
            {Object.entries(stats).length > 0 ? (
              Object.entries(stats).map(([sport, count]) => (
                <span
                  key={sport}
                  className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize"
                >
                  {sport}: {count}
                </span>
              ))
            ) : (
              <span>No upcoming games</span>
            )}
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-xs mt-3"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            View Details
          </Button>
        </CardContent>
      </Card>

      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // @ts-ignore
        bookings={bookings}
      />
    </>
  );
}
