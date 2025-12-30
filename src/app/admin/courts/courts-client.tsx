"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CourtWithDetails } from "@/types";

interface AdminCourtsClientProps {
  initialCourts: CourtWithDetails[];
}

export default function AdminCourtsClient({
  initialCourts,
}: AdminCourtsClientProps) {
  const [courts, setCourts] = useState<CourtWithDetails[]>(initialCourts);
  const router = useRouter();

  const handleStatusUpdate = async (
    courtId: string,
    newStatus: "approved" | "pending" | "rejected"
  ) => {
    try {
      const response = await fetch(`/api/courts/${courtId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          is_active: newStatus === "approved",
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Court ${newStatus} successfully!`);

      // Update local state
      setCourts(
        courts.map((c) =>
          c.id === courtId
            ? { ...c, status: newStatus, is_active: newStatus === "approved" }
            : c
        )
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating court status:", error);
      toast.error("Error updating court status");
    }
  };

  const handleDelete = async (courtId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this court? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`/api/courts/${courtId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete court");

      toast.success("Court deleted successfully");
      setCourts(courts.filter((c) => c.id !== courtId));
      setCourts(courts.filter((c) => c.id !== courtId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting court:", error);
      toast.error("Error deleting court");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pending
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">All Courts ({courts.length})</h2>
        <Button asChild>
          <Link href="/admin/courts/new">
            <Plus className="mr-2 h-4 w-4" /> Add Court
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Sports</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courts.map((court: CourtWithDetails) => (
            <TableRow
              key={court.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{court.name}</TableCell>
              <TableCell>{court.city}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{court.profiles?.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {court.profiles?.phone}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {court.sports?.map((s: string) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="text-[10px] px-1 py-0 capitalize"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>${court.price_per_hour}/hr</TableCell>
              <TableCell>{getStatusBadge(court.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/courts/${court.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/courts/${court.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Court
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Management</DropdownMenuLabel>
                    {court.status !== "approved" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(court.id, "approved")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                        Approve
                      </DropdownMenuItem>
                    )}
                    {court.status !== "rejected" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(court.id, "rejected")}
                      >
                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(court.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {courts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No courts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
