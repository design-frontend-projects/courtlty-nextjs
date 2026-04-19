"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, MapPinned, ShieldCheck, Star, User } from "lucide-react";
import Link from "next/link";

import BookingForm from "@/components/courts/booking-form";
import { CourtMap } from "@/components/courts/CourtMap";
import CourtGallery from "@/components/courts/court-gallery";
import ReviewsList from "@/components/courts/reviews-list";
import { EmptyState, PageHeader, SectionShell, WorkspaceShell } from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CourtData {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  price_per_hour: number;
  sports: string[];
  amenities: string[];
  payment_methods: string[];
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
  court_images: {
    id: string;
    url: string;
    is_primary: boolean;
    display_order: number;
  }[];
  court_availability: {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchCourtById(courtId: string): Promise<CourtData> {
  const response = await fetch(`/api/courts/${courtId}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error || "Failed to load court.", response.status);
  }

  if (!payload?.court) {
    throw new ApiError("Court payload was empty.", 500);
  }

  return payload.court as CourtData;
}

function CourtDetailLoadingState() {
  return (
    <WorkspaceShell className="gap-6">
      <div className="surface-panel-strong space-y-4 px-6 py-7 sm:px-8 sm:py-8">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-12 w-2/3 rounded-xl" />
        <Skeleton className="h-6 w-1/2 rounded-xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-[32rem] rounded-[2rem]" />
        <Skeleton className="h-[25rem] rounded-[2rem]" />
      </div>
    </WorkspaceShell>
  );
}

export default function CourtDetailClient({ courtId }: { courtId: string }) {
  const {
    data: court,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["court", courtId],
    queryFn: () => fetchCourtById(courtId),
    retry: false,
  });

  if (isLoading) {
    return <CourtDetailLoadingState />;
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <WorkspaceShell>
        <EmptyState
          icon={AlertTriangle}
          title="Court not found"
          description="The court you requested does not exist, or it was removed."
          action={
            <Button asChild className="rounded-full px-6">
              <Link href="/courts">Back to courts</Link>
            </Button>
          }
        />
      </WorkspaceShell>
    );
  }

  if (!court) {
    return (
      <WorkspaceShell>
        <EmptyState
          icon={AlertTriangle}
          title="Unable to load court"
          description="We could not load this court right now. Try again."
          action={
            <Button className="rounded-full px-6" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      </WorkspaceShell>
    );
  }

  const reviews = court.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <WorkspaceShell className="gap-6">
      <PageHeader
        eyebrow="Court profile"
        title={court.name}
        description={`${court.address || "Address unavailable"}, ${court.city || "Unknown city"}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {(court.sports || []).map((sport) => (
              <Badge key={sport} variant="secondary" className="rounded-full px-3 py-1">
                {sport}
              </Badge>
            ))}
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/courts">Back to courts</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-6">
          <div className="surface-panel overflow-hidden rounded-[2rem] py-0">
            <CourtGallery images={court.court_images || []} courtName={court.name} />
          </div>

          <Tabs defaultValue="overview" className="grid gap-5">
            <TabsList className="h-12 rounded-full bg-accent/45 p-1">
              <TabsTrigger value="overview" className="rounded-full">
                Overview
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-full">
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="grid gap-6">
              <SectionShell
                title="About this court"
                description="Make the booking decision with the essentials first: quality, location, amenities, and trust signals."
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
                  <div className="space-y-6">
                    <p className="text-sm leading-7 text-muted-foreground">
                      {court.description ||
                        "Professional sports facility designed for recurring team sessions, weekend play, and competitive bookings."}
                    </p>

                    <div className="grid gap-3">
                      {(court.amenities || []).map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 rounded-[1.35rem] border border-border/70 bg-accent/20 px-4 py-3 text-sm text-foreground"
                        >
                          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-300" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="surface-panel overflow-hidden rounded-[1.7rem] px-4 py-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MapPinned className="size-4 text-primary" />
                        <p className="section-kicker text-[0.68rem]">Location</p>
                      </div>
                      <div className="overflow-hidden rounded-[1.35rem] border border-border/70">
                        <CourtMap address={`${court.address || ""}, ${court.city || ""}`} />
                      </div>
                    </div>

                    <div className="surface-panel rounded-[1.7rem] px-5 py-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="section-kicker text-[0.68rem]">Managed by</p>
                          <p className="font-display mt-2 text-2xl font-semibold">
                            {court.profiles?.full_name || "Court owner"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {court.profiles?.phone || "Phone not listed"}
                          </p>
                        </div>
                        <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                          <User className="size-5" />
                        </div>
                      </div>

                      {avgRating ? (
                        <div className="flex items-center gap-3 rounded-[1.35rem] border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                          <Star className="size-5 fill-current text-amber-500" />
                          <div>
                            <p className="font-display text-2xl font-semibold text-foreground">{avgRating}</p>
                            <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </SectionShell>
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsList reviews={reviews} courtId={court.id} onReviewSubmitted={() => void refetch()} />
            </TabsContent>

            <TabsContent value="schedule">
              <SectionShell
                title="Availability windows"
                description="Use the listed operating windows to decide if the session fits your team schedule."
              >
                <div className="grid gap-3">
                  {court.court_availability?.length > 0 ? (
                    court.court_availability.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-[1.35rem] border border-border/70 bg-accent/20 px-4 py-4"
                      >
                        <span className="font-medium capitalize text-foreground">{item.day_of_week}</span>
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                          {item.start_time} - {item.end_time}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No specific hours listed yet. Contact the owner for availability details.
                    </p>
                  )}
                </div>
              </SectionShell>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
          <div className="surface-panel-strong rounded-[2rem] px-6 py-6">
            <div className="space-y-2 border-b border-border/70 pb-5">
              <p className="section-kicker text-[0.68rem]">Starting rate</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold text-primary">${court.price_per_hour}</span>
                <span className="text-sm text-muted-foreground">per hour</span>
              </div>
            </div>
            <div className="pt-5">
              <BookingForm
                courtId={court.id}
                courtName={court.name}
                sports={court.sports || []}
                pricePerHour={court.price_per_hour || 0}
              />
            </div>
          </div>

          <div className="surface-panel rounded-[1.85rem] px-5 py-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-300" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">Courtly booking protection</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Booking details, rate visibility, and confirmation status stay visible all the way through checkout.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-2 text-sm text-muted-foreground">
              {(court.payment_methods || []).map((method) => (
                <div key={method} className="flex items-center justify-between">
                  <span>{method}</span>
                  <span className="status-dot" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </WorkspaceShell>
  );
}
