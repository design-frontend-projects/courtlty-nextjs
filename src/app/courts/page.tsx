import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CourtWithDetails } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ArrowRight, Trophy, Star } from "lucide-react";

export default async function CourtsPage() {
  const supabase = await createClient();

  const { data: courts } = await supabase
    .from("courts")
    .select(
      `
      *,
      profiles:owner_id (*),
      court_images (*)
    `
    )
    .eq("status", "approved")
    .eq("is_active", true);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544105072-422f92bcc22d?q=80&w=2070')] bg-cover bg-center scale-105 animate-pulse-slow" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md px-4 py-1.5 text-sm font-bold uppercase tracking-wider">
            Premium Court Booking
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
            FIND YOUR <span className="text-blue-500">ARENA</span>
          </h1>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[28px] p-2 shadow-2xl border border-white/20">
              <div className="flex-1 flex items-center px-6">
                <Search className="h-6 w-6 text-blue-500 mr-4" />
                <Input
                  placeholder="Search by name, city or sport..."
                  className="border-0 bg-transparent focus-visible:ring-0 text-lg h-12 p-0 placeholder:text-gray-400 font-medium"
                />
              </div>
              <Button
                size="lg"
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Courts Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-30">
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              Available Courts
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground font-medium mt-1">
              Discover top-rated courts near you
            </p>
          </div>
          <div className="flex gap-2">{/* Filters placeholder */}</div>
        </div>

        {courts && courts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courts.map((court: CourtWithDetails) => (
              <Link key={court.id} href={`/courts/${court.id}`}>
                <Card className="group overflow-hidden rounded-[32px] border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-64 overflow-hidden">
                    {court.court_images?.[0] ? (
                      <img
                        src={court.court_images[0].url}
                        alt={court.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-gray-900 border-0 shadow-lg font-bold">
                        ${court.price_per_hour}/hr
                      </Badge>
                    </div>
                    {/* Sport Tags */}
                    <div className="absolute bottom-4 left-4 flex gap-1.5 flex-wrap pr-4">
                      {court.sports.map((sport: string) => (
                        <Badge
                          key={sport}
                          className="bg-blue-600/80 backdrop-blur-md text-white border-0 text-[10px] font-black uppercase tracking-wider"
                        >
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                          {court.name}
                        </h3>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          {court.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        4.8
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700"
                          />
                        ))}
                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          +12
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 font-bold gap-2 p-0 group/btn"
                      >
                        Book Now
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-400">
              No courts listed yet.
            </h3>
          </div>
        )}
      </section>
    </main>
  );
}
