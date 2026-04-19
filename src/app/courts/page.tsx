import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Trophy } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { CourtWithDetails } from "@/types";
import { PageHeader, WorkspaceShell } from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourtFilters } from "./_components/court-filters";

interface SearchParams {
  q?: string;
  sport?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function CourtsPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const { q, sport, city, minPrice, maxPrice } = searchParams;
  const supabase = await createClient();

  let query = supabase.from("courts").select("*").eq("status", "approved").eq("is_active", true);

  if (q) {
    query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%`);
  }
  if (sport && sport !== "all") {
    query = query.contains("sports", [sport]);
  }
  if (city && city !== "all") {
    query = query.eq("city", city);
  }
  if (minPrice) {
    query = query.gte("price_per_hour", minPrice);
  }
  if (maxPrice) {
    query = query.lte("price_per_hour", maxPrice);
  }

  const [{ data: citiesData }, { data: sportsData }, { data: courts }] = await Promise.all([
    supabase.from("courts").select("city").eq("is_active", true).not("city", "is", null),
    supabase.from("courts").select("sports").eq("is_active", true),
    query,
  ]);

  const uniqueCities = Array.from(new Set(citiesData?.map((item) => item.city).filter(Boolean) as string[])).sort();
  const uniqueSports = Array.from(new Set(sportsData?.flatMap((item) => item.sports) || [])).sort();

  return (
    <WorkspaceShell className="gap-6">
      <PageHeader
        eyebrow="Court discovery"
        title="Find the right court fast."
        description="Search active venues by sport, city, and price, then move straight into booking without losing context."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
              {courts?.length || 0} active results
            </div>
          </div>
        }
      />

      <CourtFilters availableSports={uniqueSports} cities={uniqueCities} />

      {courts && courts.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {courts.map((court: CourtWithDetails) => (
            <Link key={court.id} href={`/courts/${court.id}`} className="group">
              <Card className="surface-panel overflow-hidden rounded-[2rem] py-0 transition-transform duration-200 group-hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden border-b border-border/70 bg-muted">
                  {court.court_images?.[0] ? (
                    <Image
                      src={court.court_images[0].url}
                      alt={court.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.03),rgba(15,23,42,0.1))]">
                      <Trophy className="size-11 text-primary/55" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.72))] p-5">
                    <div className="flex flex-wrap gap-2">
                      {court.sports.map((item: string) => (
                        <Badge key={item} className="border-white/15 bg-white/14 text-white shadow-none">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/12 px-3 py-2 text-right text-white backdrop-blur-sm">
                      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/64">Rate</p>
                      <p className="font-display text-2xl font-semibold">${court.price_per_hour}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-5 px-6 py-6">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                          {court.name}
                        </h2>
                        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4 text-primary" />
                          {court.city}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
                        Available
                      </span>
                    </div>
                    {court.description ? (
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{court.description}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/70 pt-4">
                    <p className="text-sm text-muted-foreground">Open court details, availability, and booking.</p>
                    <Button variant="ghost" className="rounded-full px-0 text-primary hover:bg-transparent hover:text-primary">
                      View court
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      ) : (
        <div className="surface-panel rounded-[2rem] px-6 py-16 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
            <div className="rounded-2xl border border-border/80 bg-background/90 p-4 text-primary">
              <Trophy className="size-7" />
            </div>
            <h2 className="font-display text-3xl font-semibold">No courts matched those filters.</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Reset the current search or widen your city and price range to surface more options.
            </p>
            <Button asChild className="rounded-full px-6">
              <Link href="/courts">Reset search</Link>
            </Button>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
