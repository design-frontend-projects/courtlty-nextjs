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
import {
  Users,
  Trophy,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

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
        .update({ status, is_active: status === "approved" })
        .eq("id", courtId);

      if (error) throw error;

      toast.success(`Court ${status} successfully`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            Overview of your platform performance and tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-xl shadow-sm">
            <Link href="/admin/courts">
              <Trophy className="mr-2 h-4 w-4" /> Manage Courts
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700"
          >
            <Link href="/courts">
              View Site <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[32px] border-0 shadow-xl bg-linear-to-br from-orange-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">
              Pending Approvals
            </CardTitle>
            <Clock className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-5xl font-black drop-shadow-md">
              {stats.pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-0 shadow-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">
              Total Courts
            </CardTitle>
            <Trophy className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-5xl font-black drop-shadow-md">
              {stats.totalCourts}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-0 shadow-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-5xl font-black drop-shadow-md">
              {stats.totalUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Clock className="text-blue-600 h-6 w-6" /> Pending Submissions
          </h2>
          <Link
            href="/admin/courts"
            className="text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[32px] border shadow-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold py-5 pl-8 text-xs uppercase tracking-wider">
                  Court Details
                </TableHead>
                <TableHead className="font-bold py-5 text-xs uppercase tracking-wider">
                  Owner
                </TableHead>
                <TableHead className="font-bold py-5 text-xs uppercase tracking-wider">
                  Pricing
                </TableHead>
                <TableHead className="font-bold py-5 text-xs uppercase tracking-wider">
                  Sports
                </TableHead>
                <TableHead className="font-bold py-5 pr-8 text-right text-xs uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingCourts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-10 w-10 text-emerald-500" />
                      No pending courts found. Everything is up to date!
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pendingCourts.map((court: Court) => (
                  <TableRow
                    key={court.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-6 pl-8">
                      <div className="flex flex-col">
                        <span className="font-black text-lg">{court.name}</span>
                        <span className="text-sm text-muted-foreground font-medium capitalize">
                          {court.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">
                          {court.profiles?.full_name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {court.profiles?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 font-black text-blue-600 dark:text-blue-400">
                      ${court.price_per_hour}/hr
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {court.sports?.map((sport: string) => (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md"
                          >
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 pr-8 text-right space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold px-4"
                        onClick={() => handleUpdateStatus(court.id, "rejected")}
                        disabled={loadingId === court.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-4 shadow-md"
                        onClick={() => handleUpdateStatus(court.id, "approved")}
                        disabled={loadingId === court.id}
                      >
                        {loadingId === court.id ? (
                          "Working..."
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </>
                        )}
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
