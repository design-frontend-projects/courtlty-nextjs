import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Info,
  Star,
  ShieldCheck,
  MapPinned,
  CreditCard,
  User,
  History,
} from "lucide-react";
import BookingForm from "@/components/courts/booking-form";
import ReviewsList from "@/components/courts/reviews-list";
import CourtGallery from "@/components/courts/court-gallery";
import { CourtMap } from "@/components/courts/CourtMap";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// Define strict types for the query result
interface CourtData {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: court } = await supabase
    .from("courts")
    .select("name, description, city")
    .eq("id", id)
    .single();

  if (!court) {
    return {
      title: "Court Not Found",
    };
  }

  return {
    title: `${court.name} | Courtly`,
    description:
      court.description || `Book ${court.name} in ${court.city} on Courtly.`,
  };
}

export default async function CourtDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Optimized query selecting only necessary fields
  const { data: courtRaw, error } = await supabase
    .from("courts")
    .select(
      `
    id,
    name,
    description,
    address,
    city,
    price_per_hour,
    sports,
    amenities,
    payment_methods,
    owner_id,
    profiles!inner (
      id,
      full_name,
      avatar_url,
      phone
    ),
    court_images (
      id,
      url,
      is_primary,
      display_order
    ),
    court_availability (
      id,
      day_of_week,
      start_time,
      end_time,
      is_available
    ),
    reviews (
      id,
      rating,
      comment,
      created_at,
      reviewer_id,
      profiles (
        full_name,
        avatar_url
      )
    )
  `,
    )
    .eq("id", id)
    .single();

  if (error || !courtRaw) {
    if (error) console.error("Court fetch error:", error);
    notFound();
  }

  // Cast strictly to our interface
  const court = courtRaw as unknown as CourtData;

  // Calculate average rating
  const reviews = court.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-20">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/courts">
            <Button variant="ghost" className="gap-2 rounded-xl">
              <ChevronLeft className="h-4 w-4" />
              Back to Discover
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-green-50 text-green-700 border-green-200"
            >
              Available Now
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Section */}
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <CourtGallery
                images={court.court_images || []}
                courtName={court.name}
              />
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border mb-8">
                <TabsTrigger
                  value="details"
                  className="rounded-xl flex gap-2 font-bold focus:shadow-sm"
                >
                  <Info className="h-4 w-4" /> Details
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-xl flex gap-2 font-bold"
                >
                  <Star className="h-4 w-4" /> Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="availability"
                  className="rounded-xl flex gap-2 font-bold"
                >
                  <History className="h-4 w-4" /> Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="details"
                className="space-y-8 animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                        {court.name}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground text-lg">
                        <MapPinned className="h-5 w-5 text-blue-600" />
                        {court.address}, {court.city}
                      </div>
                    </div>
                    {avgRating && (
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 rounded-2xl border border-yellow-200 dark:border-yellow-800 shadow-sm">
                        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-yellow-700 dark:text-yellow-500">
                            {avgRating}
                          </span>
                          <span className="text-xs font-bold text-yellow-600/70">
                            {court.reviews?.length} Reviews
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {court.description && (
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
                      {court.description}
                    </div>
                  )}

                  <Separator className="my-8" />

                  <CourtMap
                    address={`${court.address || ""}, ${court.city || ""}`}
                  />

                  <Separator className="my-8" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />{" "}
                        Available Sports
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {court.sports?.map((sport) => (
                          <Badge
                            key={sport}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold capitalize text-sm shadow-md"
                          >
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />{" "}
                        Payments
                      </h3>
                      <div className="flex gap-3">
                        {court.payment_methods?.map((method) => (
                          <Badge
                            key={method}
                            variant="secondary"
                            className="px-4 py-2 rounded-xl text-sm font-bold capitalize"
                          >
                            {method === "card" ? "💳 Card" : "💵 Cash"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-10" />

                  <div className="space-y-6">
                    <h3 className="text-xl font-black">
                      Facilities & Amenities
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                      {court.amenities?.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border transition-colors hover:bg-muted/60"
                        >
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-200">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border">
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-600" /> Managed By
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                      {court.profiles?.full_name?.charAt(0) || "C"}
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-black">
                        {court.profiles?.full_name || "Owner Name"}
                      </p>
                      <p className="text-muted-foreground font-medium">
                        {court.profiles?.phone || "Phone not listed"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="reviews"
                className="animate-in fade-in slide-in-from-bottom-2"
              >
                <ReviewsList reviews={court.reviews || []} courtId={court.id} />
              </TabsContent>

              <TabsContent
                value="availability"
                className="animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border">
                  <h3 className="text-2xl font-black mb-6">Court Schedule</h3>
                  <div className="space-y-4">
                    {court.court_availability?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {court.court_availability.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-4 rounded-2xl bg-muted/30 border"
                          >
                            <span className="font-bold capitalize">
                              {item.day_of_week}
                            </span>
                            <Badge className="font-mono">
                              {item.start_time} - {item.end_time}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        No specific hours listed. Contact owner for details.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="rounded-[40px] shadow-2xl border-0 overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
                <div className="h-32 bg-linear-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-end">
                  <p className="text-blue-100 font-bold mb-1">Starting at</p>
                  <div className="flex items-baseline gap-2 text-white">
                    <span className="text-5xl font-black">
                      ${court.price_per_hour}
                    </span>
                    <span className="text-lg font-bold opacity-80">/hour</span>
                  </div>
                </div>
                <CardContent className="p-8">
                  <BookingForm
                    courtId={court.id}
                    courtName={court.name}
                    sports={court.sports || []}
                    pricePerHour={court.price_per_hour || 0}
                  />
                </CardContent>
              </Card>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-black text-blue-900 dark:text-blue-200">
                    Courtly Protection
                  </h4>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1 font-medium">
                    Your booking is protected. If the court isn&apos;t as
                    described, we&apos;ll make it right.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
