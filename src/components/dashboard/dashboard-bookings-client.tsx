"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { MetricTile } from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";

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

export function DashboardBookingsClient({ bookings }: DashboardBookingsClientProps) {
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
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        <MetricTile
          label="Upcoming bookings"
          value={bookings.length}
          icon={CalendarDays}
          meta={
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(stats).length > 0 ? (
                Object.entries(stats).map(([sport, count]) => (
                  <span key={sport} className="rounded-full border border-border/70 bg-accent/25 px-2.5 py-1 text-xs capitalize">
                    {sport}: {count}
                  </span>
                ))
              ) : (
                <span>No upcoming games</span>
              )}
              <Button
                variant="link"
                className="h-auto rounded-full p-0 text-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                View details
              </Button>
            </div>
          }
        />
      </div>

      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookings={bookings as never}
      />
    </>
  );
}
