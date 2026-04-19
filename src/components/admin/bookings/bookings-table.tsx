"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Bell,
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Booking, Court, Profile } from "@/types";
import { EmptyState } from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type BookingWithRelations = Booking & {
  courts: Pick<Court, "name"> | null;
  profiles: Pick<Profile, "full_name" | "phone"> | null;
};

interface BookingsTableProps {
  initialBookings: BookingWithRelations[];
}

const statusTone: Record<string, string> = {
  confirmed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  cancelled: "border-destructive/20 bg-destructive/10 text-destructive",
  completed: "border-primary/20 bg-primary/10 text-primary",
};

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const router = useRouter();

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Booking ${newStatus}`);
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status: newStatus as Booking["status"] } : booking,
        ),
      );
      router.refresh();
    } catch {
      toast.error("Error updating status");
    }
  };

  const handleNotify = async () => {
    if (!selectedBooking || !notificationMessage.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: notificationMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      toast.success("Notification sent");
      setNotificationOpen(false);
      setNotificationMessage("");
      setSelectedBooking(null);
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      toast.success("Booking deleted");
      setBookings((current) => current.filter((booking) => booking.id !== selectedBooking));
      setDeleteOpen(false);
      setSelectedBooking(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="operator-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-5">
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-semibold tracking-tight">Booking requests</h3>
            <p className="text-sm text-muted-foreground">
              Fast access to schedule changes, confirmations, and deletions.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/admin/bookings/new">New booking</Link>
          </Button>
        </div>

        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/70">
                  <TableHead>Customer</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="border-border/60">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {booking.profiles?.full_name || "Guest booking"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.profiles?.phone || "No phone provided"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.courts?.name || "Unknown court"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {format(new Date(booking.booking_date), "MMM dd, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>${booking.total_amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`rounded-full border ${statusTone[booking.status] || "border-border/70"}`}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                          <DropdownMenuLabel>Booking actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/bookings/${booking.id}`}>
                              <Eye />
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/bookings/${booking.id}/edit`}>
                              <Edit />
                              Edit booking
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              setNotificationOpen(true);
                            }}
                          >
                            <Bell />
                            Notify user
                          </DropdownMenuItem>

                          {booking.status === "pending" ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                              >
                                <CheckCircle2 />
                                Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                              >
                                <XCircle />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          ) : null}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="px-5 py-8">
            <EmptyState
              title="No booking requests"
              description="Once players start reserving courts, the latest activity will appear here for review."
            />
          </div>
        )}
      </div>

      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="rounded-[1.75rem]">
          <DialogHeader>
            <DialogTitle>Send notification</DialogTitle>
            <DialogDescription>
              Push an update to the user attached to this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="notification_message">Message</Label>
            <Textarea
              id="notification_message"
              value={notificationMessage}
              onChange={(event) => setNotificationMessage(event.target.value)}
              placeholder="Court access changed, payment confirmed, or schedule update."
              className="min-h-32 rounded-2xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setNotificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNotify} className="rounded-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Send notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-[1.75rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the booking and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Delete booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
