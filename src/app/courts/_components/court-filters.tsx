"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { FilterBar } from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CourtFiltersProps {
  availableSports: string[];
  cities: string[];
}

export function CourtFilters({ availableSports, cities }: CourtFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sport, setSport] = useState(searchParams.get("sport") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const activeFiltersCount = [sport !== "all", city !== "all", Boolean(minPrice), Boolean(maxPrice)]
    .filter(Boolean)
    .length;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sport !== "all") params.set("sport", sport);
    if (city !== "all") params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/courts?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSport("all");
    setCity("all");
    setMinPrice("");
    setMaxPrice("");
    router.push("/courts");
  };

  const desktopFilters = (
    <div className="grid gap-3 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.5fr_0.5fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
          placeholder="Search by court name or city"
          className="h-12 rounded-2xl pl-11"
        />
      </div>

      <Select value={sport} onValueChange={setSport}>
        <SelectTrigger className="h-12 rounded-2xl">
          <SelectValue placeholder="Sport" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sports</SelectItem>
          {availableSports.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={city} onValueChange={setCity}>
        <SelectTrigger className="h-12 rounded-2xl">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cities</SelectItem>
          {cities.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Min"
        value={minPrice}
        onChange={(event) => setMinPrice(event.target.value)}
        className="h-12 rounded-2xl"
      />

      <Input
        type="number"
        placeholder="Max"
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        className="h-12 rounded-2xl"
      />

      <div className="flex items-center gap-2">
        <Button onClick={handleSearch} className="h-12 rounded-full px-5">
          Search
        </Button>
        <Button variant="outline" onClick={clearFilters} className="h-12 rounded-full px-5">
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <FilterBar className="space-y-4 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Discovery controls</p>
          <p className="text-sm text-muted-foreground">Find the right venue without leaving the results grid.</p>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button onClick={handleSearch} className="rounded-full px-5">
            Search
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full px-4">
                <SlidersHorizontal data-icon="inline-start" />
                Filters
                {activeFiltersCount > 0 ? (
                  <Badge variant="secondary" className="ml-1 rounded-full">
                    {activeFiltersCount}
                  </Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[2rem]">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-2xl font-semibold">Refine courts</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or city"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {availableSports.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    {cities.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    className="h-12 rounded-2xl"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    className="h-12 rounded-2xl"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={clearFilters} className="h-12 flex-1 rounded-full">
                    Reset
                  </Button>
                  <Button onClick={handleSearch} className="h-12 flex-1 rounded-full">
                    Show results
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="hidden lg:block">{desktopFilters}</div>
    </FilterBar>
  );
}
