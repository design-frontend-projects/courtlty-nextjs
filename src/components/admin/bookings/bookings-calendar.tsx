"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Booking } from "@/types";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type CalendarBooking = Booking & {
  courts?: { name: string | null } | null;
  profiles?: { full_name: string | null } | null;
};

interface BookingsCalendarProps {
  initialBookings: CalendarBooking[];
}

type FetchedBooking = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number | null;
  courts: { name: string | null } | null;
  profiles: { full_name: string | null } | null;
};

const statusTone: Record<string, { background: string; border: string }> = {
  confirmed: { background: "#0f766e", border: "#14b8a6" },
  pending: { background: "#a16207", border: "#f59e0b" },
  cancelled: { background: "#b91c1c", border: "#ef4444" },
  completed: { background: "#1d4ed8", border: "#60a5fa" },
};

function toCalendarEvent(booking: CalendarBooking): EventInput {
  const tone = statusTone[booking.status] || { background: "#334155", border: "#64748b" };

  return {
    id: booking.id,
    title: `${booking.profiles?.full_name || "Guest"} @ ${booking.courts?.name || "Court"}`,
    start: `${booking.booking_date}T${booking.start_time}`,
    end: `${booking.booking_date}T${booking.end_time}`,
    backgroundColor: tone.background,
    borderColor: tone.border,
    extendedProps: {
      status: booking.status,
      total: booking.total_amount,
    },
  };
}

export default function BookingsCalendar({ initialBookings }: BookingsCalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setEvents(initialBookings.map(toCalendarEvent));
  }, [initialBookings]);

  const fetchBookings = async (start: Date, end: Date) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_date, start_time, end_time, status, total_amount, courts(name), profiles(full_name)")
        .gte("booking_date", start.toISOString().split("T")[0])
        .lte("booking_date", end.toISOString().split("T")[0]);

      if (error) {
        throw error;
      }

      setEvents(((data || []) as FetchedBooking[]).map((booking) => toCalendarEvent(booking)));
    } catch (error) {
      console.error("Error fetching bookings", error);
      toast.error("Failed to fetch bookings");
    }
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    void fetchBookings(arg.start, arg.end);
  };

  const handleEventClick = (info: EventClickArg) => {
    router.push(`/admin/bookings/${info.event.id}`);
  };

  return (
    <div className="operator-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-5">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Schedule board</h2>
          <p className="text-sm text-muted-foreground">
            View sessions by day, week, or month and open them directly from the board.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            Confirmed
          </Badge>
          <Badge className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
            Pending
          </Badge>
          <Badge className="rounded-full bg-destructive/15 text-destructive">Cancelled</Badge>
        </div>
      </div>

      <div className="bg-card/70 px-2 pb-3 pt-2">
        <style jsx global>{`
          .courtly-admin-calendar {
            --fc-border-color: color-mix(in oklab, var(--border) 86%, transparent);
            --fc-button-bg-color: color-mix(in oklab, var(--card) 95%, transparent);
            --fc-button-border-color: color-mix(in oklab, var(--border) 86%, transparent);
            --fc-button-text-color: var(--foreground);
            --fc-button-hover-bg-color: color-mix(in oklab, var(--accent) 62%, transparent);
            --fc-button-hover-border-color: color-mix(in oklab, var(--border) 86%, transparent);
            --fc-button-active-bg-color: color-mix(in oklab, var(--primary) 16%, var(--card) 84%);
            --fc-event-border-color: transparent;
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: transparent;
          }

          .courtly-admin-calendar .fc-toolbar {
            padding: 0.9rem 0.8rem 0.4rem;
          }

          .courtly-admin-calendar .fc-toolbar-title {
            font-family: var(--font-display), sans-serif;
            font-size: 1.2rem;
            font-weight: 600;
            letter-spacing: -0.03em;
          }

          .courtly-admin-calendar .fc-button {
            border-radius: 999px;
            box-shadow: none;
            padding-inline: 0.85rem;
          }

          .courtly-admin-calendar .fc-scrollgrid,
          .courtly-admin-calendar .fc-theme-standard td,
          .courtly-admin-calendar .fc-theme-standard th {
            border-color: color-mix(in oklab, var(--border) 70%, transparent);
          }

          .courtly-admin-calendar .fc-daygrid-day-frame {
            min-height: 104px;
          }

          .courtly-admin-calendar .fc-event {
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 0.78rem;
            font-weight: 600;
            line-height: 1.25;
          }
        `}</style>

        <div className="courtly-admin-calendar">
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
            expandRows
            dayHeaderFormat={{ weekday: "short", day: "numeric" }}
            noEventsContent={() => (
              <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
                <CalendarDays className="size-5 text-primary" />
                No bookings in this range
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
