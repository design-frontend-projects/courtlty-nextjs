"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const activeFiltersCount = [
    sport !== "all",
    city !== "all",
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sport && sport !== "all") params.set("sport", sport);
    if (city && city !== "all") params.set("city", city);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-6 relative z-30 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-[24px] shadow-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-gray-200 dark:border-gray-800 gap-2 font-semibold"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ml-1"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-2xl font-black">
                    Filter Courts
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-8">
                  {/* Sport Filter */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Sport
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setSport("all")}
                        className={`h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                          sport === "all"
                            ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        All Sports
                      </button>
                      {availableSports.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSport(s)}
                          className={`h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                            sport === s
                              ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Location
                    </label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-12 rounded-xl text-base font-medium">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Price Range ($/hr)
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="pl-8 h-12 rounded-xl"
                        />
                      </div>
                      <span className="text-gray-400 font-medium">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="pl-8 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-8 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1 h-14 rounded-2xl font-bold text-base"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => {
                        handleSearch();
                        // Close sheet is handled implicitly if we had a state for open, but SheetTrigger as child usually handles it.
                        // Actually better to have controlled sheet state if we want to close it,
                        // but let's assume the user will close it or we can add a close trigger.
                        // For now keep it simple.
                      }}
                      className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-lg shadow-blue-500/20"
                    >
                      Show Results
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              size="lg"
              onClick={handleSearch}
              className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
