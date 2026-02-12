"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Bell,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Booking, Court, Profile } from "@/types";

type BookingWithRelations = Booking & {
  courts: Pick<Court, "name"> | null;
  profiles: Pick<Profile, "full_name" | "phone"> | null;
};

interface BookingsTableProps {
  initialBookings: BookingWithRelations[];
}

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const router = useRouter();

  // State for actions
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Booking ${newStatus}`);
      setBookings(
        bookings.map((b) =>
          b.id === id ? { ...b, status: newStatus as Booking["status"] } : b,
        ),
      );
      router.refresh();
    } catch {
      toast.error("Error updating status");
    }
  };

  const handleNotify = async () => {
    if (!selectedBooking || !notificationMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: notificationMessage }),
      });

      if (!response.ok) throw new Error("Failed to send notification");

      toast.success("Notification sent successfully");
      setNotificationOpen(false);
      setNotificationMessage("");
      setSelectedBooking(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete booking");

      toast.success("Booking deleted successfully");
      setBookings(bookings.filter((b) => b.id !== selectedBooking));
      setDeleteOpen(false);
      setSelectedBooking(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-emerald-500 hover:bg-emerald-600",
      pending: "bg-amber-500 hover:bg-amber-600",
      cancelled: "bg-red-500 hover:bg-red-600",
    };
    return <Badge className={styles[status] || "bg-gray-500"}>{status}</Badge>;
  };

  return (
    <>
      <div className="rounded-[24px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Booking Requests</h3>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/bookings/new">New Booking</Link>
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold">Court</TableHead>
              <TableHead className="font-bold">Date & Time</TableHead>
              <TableHead className="font-bold">Total</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{booking.profiles?.full_name || "Guest"}</span>
                    <span className="text-xs text-muted-foreground">
                      {booking.profiles?.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{booking.courts?.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(booking.booking_date), "MMM dd, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                </TableCell>
                <TableCell>${booking.total_amount}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/bookings/${booking.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBooking(booking.id);
                          setNotificationOpen(true);
                        }}
                      >
                        <Bell className="mr-2 h-4 w-4" /> Notify User
                      </DropdownMenuItem>

                      {booking.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(booking.id, "confirmed")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(booking.id, "cancelled")
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />{" "}
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          setSelectedBooking(booking.id);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No recent bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Notification Dialog */}
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a push notification to the user(s) associated with this
              booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Enter your message here..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotificationOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleNotify} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              booking from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
