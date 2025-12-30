"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Court {
  id: string;
  name: string;
  city: string;
  price_per_hour: number;
  sports: string[];
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface AdminDashboardClientProps {
  pendingCourts: Court[];
  stats: {
    totalCourts: number;
    totalUsers: number;
    pendingCount: number;
  };
}

export default function AdminDashboardClient({
  pendingCourts,
  stats,
}: AdminDashboardClientProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateStatus = async (
    courtId: string,
    status: "approved" | "rejected"
  ) => {
    setLoadingId(courtId);

    try {
      const { error } = await supabase
        .from("courts")
        .update({ status })
        .eq("id", courtId);

      if (error) throw error;

      toast.success(`Court ${status} successfully`);
      router.refresh();
    } catch (err: unknown) {
      let message = "An error occurred";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Pending Court Submissions
        </h2>
        <div className="rounded-md border bg-white dark:bg-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Court Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price/Hr</TableHead>
                <TableHead>Sports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingCourts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No pending courts found.
                  </TableCell>
                </TableRow>
              ) : (
                pendingCourts.map((court: Court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{court.profiles?.full_name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">
                          {court.profiles?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{court.city}</TableCell>
                    <TableCell>${court.price_per_hour}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {court.sports?.map((sport: string) => (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className="text-xs"
                          >
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(court.id, "rejected")}
                        disabled={loadingId === court.id}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateStatus(court.id, "approved")}
                        disabled={loadingId === court.id}
                      >
                        {loadingId === court.id ? "Processing..." : "Approve"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
