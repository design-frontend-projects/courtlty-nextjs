"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
  };
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
}

export function BookingDetailsModal({
  isOpen,
  onClose,
  bookings,
}: BookingDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upcoming Bookings Details</DialogTitle>
          <DialogDescription>
            View details for all your upcoming games.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg bg-card"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{booking.courts?.name}</h4>
                  <Badge variant="outline" className="capitalize">
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.courts?.address}, {booking.courts?.city}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="font-medium">
                    {format(new Date(booking.booking_date), "PPP")}
                  </div>
                  <div className="text-muted-foreground">
                    {booking.start_time} - {booking.end_time}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming bookings found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
