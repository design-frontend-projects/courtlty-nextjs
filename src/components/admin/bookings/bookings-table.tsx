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
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, CheckCircle, XCircle } from "lucide-react";
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
          b.id === id ? { ...b, status: newStatus as Booking["status"] } : b
        )
      );
      router.refresh();
    } catch {
      toast.error("Error updating status");
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
                    {booking.status === "pending" && (
                      <>
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
  );
}
