"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Booking } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface BookingsCalendarProps {
  initialBookings: Booking[];
}

export default function BookingsCalendar({
  initialBookings,
}: BookingsCalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Transform initial bookings to calendar events
    const transformedEvents = initialBookings.map((booking) => ({
      id: booking.id,
      title: `Booking #${booking.id.slice(0, 4)}`,
      start: `${booking.booking_date}T${booking.start_time}`,
      end: `${booking.booking_date}T${booking.end_time}`,
      extendedProps: {
        status: booking.status,
        total_price: booking.total_amount,
      },
      backgroundColor: getEventColor(booking.status),
      borderColor: getEventColor(booking.status),
    }));
    setEvents(transformedEvents);
  }, [initialBookings]);

  const fetchBookings = async (start: Date, end: Date) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, courts(name), profiles(full_name)")
        .gte("booking_date", start.toISOString().split("T")[0])
        .lte("booking_date", end.toISOString().split("T")[0]);

      if (error) throw error;

      const newEvents = data.map((booking: any) => ({
        id: booking.id,
        title: `${booking.profiles?.full_name || "Unknown"} @ ${
          booking.courts?.name || "Court"
        }`,
        start: `${booking.booking_date}T${booking.start_time}`,
        end: `${booking.booking_date}T${booking.end_time}`,
        extendedProps: {
          status: booking.status,
          courtName: booking.courts?.name,
          userName: booking.profiles?.full_name,
        },
        backgroundColor: getEventColor(booking.status),
        borderColor: getEventColor(booking.status),
      }));

      setEvents(newEvents);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    }
  };

  const handleDatesSet = (arg: any) => {
    // Fetch bookings for the view range
    // debouncing could be added here
    fetchBookings(arg.start, arg.end);
  };

  const handleEventClick = (info: any) => {
    router.push(`/admin/bookings/${info.event.id}`);
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981"; // emerald-500
      case "pending":
        return "#F59E0B"; // amber-500
      case "cancelled":
        return "#EF4444"; // red-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-md rounded-[24px] border-none overflow-hidden">
      <CardHeader className="bg-white px-6 py-4 border-b">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Calendar Schedule</span>
          <div className="flex gap-2 text-xs font-normal">
            <Badge className="bg-emerald-500">Confirmed</Badge>
            <Badge className="bg-amber-500">Pending</Badge>
            <Badge className="bg-red-500">Cancelled</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-white">
        <style jsx global>{`
          .fc {
            --fc-border-color: #e5e7eb;
            --fc-button-bg-color: #ffffff;
            --fc-button-border-color: #e5e7eb;
            --fc-button-text-color: #374151;
            --fc-button-hover-bg-color: #f3f4f6;
            --fc-button-hover-border-color: #d1d5db;
            --fc-button-active-bg-color: #e5e7eb;
            --fc-event-border-color: transparent;
          }
          .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
          }
          .fc-header-toolbar {
            padding: 1rem;
            margin-bottom: 0 !important;
          }
          .fc-daygrid-day-frame {
            min-height: 100px;
          }
          .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.8rem;
            font-weight: 600;
          }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          expandRows={true}
        />
      </CardContent>
    </Card>
  );
}
