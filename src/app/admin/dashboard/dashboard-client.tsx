"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  ActionRail,
  EmptyState,
  MetricTile,
  PageHeader,
  SectionShell,
} from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const handleUpdateStatus = async (courtId: string, status: "approved" | "rejected") => {
    setLoadingId(courtId);

    try {
      const response = await fetch(`/api/courts/${courtId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          is_active: status === "approved",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update court status");
      }

      toast.success(`Court ${status}`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to update court");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow="Admin approvals"
        title="Review new courts with speed and confidence."
        description="Prioritize pending submissions, approve trusted venues quickly, and keep the live directory clean."
        actions={
          <ActionRail>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin">
                Bookings
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/courts">Open courts inventory</Link>
            </Button>
          </ActionRail>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Pending submissions"
          value={stats.pendingCount}
          icon={Clock3}
          meta="Courts still waiting on approval or rejection."
        />
        <MetricTile
          label="Total courts"
          value={stats.totalCourts}
          icon={CheckCircle2}
          meta="Live and pending venues across the platform."
        />
        <MetricTile
          label="Total users"
          value={stats.totalUsers}
          icon={ShieldX}
          meta="Registered accounts attached to the current system."
        />
      </section>

      <SectionShell
        title="Pending court queue"
        description="Scan venue quality, ownership, and price before releasing the listing to the public directory."
      >
        {pendingCourts.length > 0 ? (
          <div className="grid gap-4">
            {pendingCourts.map((court) => (
              <div
                key={court.id}
                className="operator-panel px-5 py-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-3xl font-semibold tracking-tight">
                        {court.name}
                      </h2>
                      <Badge
                        variant="secondary"
                        className="rounded-full border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      >
                        Pending
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <p>{court.city}</p>
                      <p>${court.price_per_hour}/hour</p>
                      <p>{court.profiles?.full_name || "Unknown owner"}</p>
                      <p>{court.profiles?.email || "No email provided"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {court.sports?.map((sport) => (
                        <Badge key={sport} variant="secondary" className="rounded-full capitalize">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleUpdateStatus(court.id, "rejected")}
                      disabled={loadingId === court.id}
                    >
                      Reject
                    </Button>
                    <Button
                      className="rounded-full"
                      onClick={() => handleUpdateStatus(court.id, "approved")}
                      disabled={loadingId === court.id}
                    >
                      {loadingId === court.id ? "Working..." : "Approve venue"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="No approvals waiting"
            description="The pending queue is clear. New submissions will appear here when owners add venues."
          />
        )}
      </SectionShell>
    </div>
  );
}
