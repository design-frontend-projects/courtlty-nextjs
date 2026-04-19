"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  ShieldX,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CourtWithDetails } from "@/types";
import { EmptyState, SectionShell } from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminCourtsClientProps {
  initialCourts: CourtWithDetails[];
}

const statusTone: Record<string, string> = {
  approved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rejected: "border-destructive/20 bg-destructive/10 text-destructive",
};

export default function AdminCourtsClient({ initialCourts }: AdminCourtsClientProps) {
  const [courts, setCourts] = useState<CourtWithDetails[]>(initialCourts);
  const router = useRouter();

  const handleStatusUpdate = async (
    courtId: string,
    newStatus: "approved" | "pending" | "rejected",
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

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Court ${newStatus}`);
      setCourts((current) =>
        current.map((court) =>
          court.id === courtId
            ? { ...court, status: newStatus, is_active: newStatus === "approved" }
            : court,
        ),
      );
      router.refresh();
    } catch {
      toast.error("Error updating court status");
    }
  };

  const handleDelete = async (courtId: string) => {
    if (!confirm("Delete this court permanently?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courts/${courtId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete court");
      }

      toast.success("Court deleted");
      setCourts((current) => current.filter((court) => court.id !== courtId));
      router.refresh();
    } catch {
      toast.error("Error deleting court");
    }
  };

  return (
    <SectionShell
      title={`Court inventory (${courts.length})`}
      description="Every listing, owner, and status in one table for rapid maintenance."
    >
      {courts.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/70">
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
              {courts.map((court) => (
                <TableRow key={court.id} className="border-border/60">
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell>{court.city}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-foreground">
                        {court.profiles?.full_name || "Unknown owner"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {court.profiles?.phone || "No phone"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {court.sports?.map((sport) => (
                        <Badge key={sport} variant="secondary" className="rounded-full capitalize">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>${court.price_per_hour}/hr</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-full border ${statusTone[court.status] || "border-border/70"}`}
                    >
                      {court.status}
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
                        <DropdownMenuLabel>Court actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/courts/${court.id}`}>
                            <Eye />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courts/${court.id}/edit`}>
                            <Pencil />
                            Edit court
                          </Link>
                        </DropdownMenuItem>
                        {court.status !== "approved" ? (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(court.id, "approved")}>
                            <CheckCircle2 />
                            Approve
                          </DropdownMenuItem>
                        ) : null}
                        {court.status !== "rejected" ? (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(court.id, "rejected")}>
                            <ShieldX />
                            Reject
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(court.id)}
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
        <EmptyState
          title="No courts found"
          description="New venues will appear here once operators or owners create listings."
        />
      )}
    </SectionShell>
  );
}
