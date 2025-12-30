"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type Database } from "@/types/database.types";
import { courtSchema, type CourtFormData } from "@/lib/validations/schemas";
import { CourtWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Trophy,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";

const SPORTS_OPTIONS = [
  "Basketball",
  "Football",
  "Tennis",
  "Volleyball",
  "Badminton",
  "Padel",
];

const AMENITIES_OPTIONS = [
  "Parking",
  "Changing Rooms",
  "Showers",
  "Lockers",
  "Lighting",
  "Seating",
  "Water Fountain",
  "First Aid",
];

interface CourtSubmissionFormProps {
  initialData?: CourtWithDetails;
  mode?: "create" | "edit";
  courtId?: string;
  isAdmin?: boolean;
}

export default function CourtSubmissionForm({
  initialData,
  mode = "create",
  courtId,
  isAdmin = false,
}: CourtSubmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          sports: initialData.sports,
          size: initialData.size as Record<
            string,
            { width: number; length: number }
          >,
          address: initialData.address || "",
          city: initialData.city || "",
          price_per_hour: initialData.price_per_hour || 0,
          amenities: initialData.amenities || [],
          payment_methods: initialData.payment_methods || ["card"],
        }
      : {
          name: "",
          description: "",
          sports: [],
          size: {},
          address: "",
          city: "",
          price_per_hour: 0,
          amenities: [],
          payment_methods: ["card"],
        },
  });

  const {
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const selectedSports = watch("sports") || [];
  const selectedAmenities = watch("amenities") || [];
  const paymentMethods = watch("payment_methods") || [];
  const currentSize = watch("size") || {};

  useEffect(() => {
    const currentSizeData = {
      ...((currentSize as Record<string, { width: number; length: number }>) ||
        {}),
    };
    let changed = false;

    selectedSports.forEach((sport) => {
      const sportLower = sport.toLowerCase();
      if (!currentSizeData[sportLower]) {
        currentSizeData[sportLower] = { width: 0, length: 0 };
        changed = true;
      }
    });

    if (changed) {
      setValue("size", currentSizeData);
    }
  }, [selectedSports, setValue]);

  const toggleSport = (sport: string) => {
    const id = sport.toLowerCase();
    const newSports = selectedSports.includes(id)
      ? selectedSports.filter((s) => s !== id)
      : [...selectedSports, id];
    setValue("sports", newSports, { shouldValidate: true });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setValue("amenities", newAmenities);
  };

  const togglePaymentMethod = (method: string) => {
    const newMethods = paymentMethods.includes(method)
      ? paymentMethods.filter((m) => m !== method)
      : [...paymentMethods, method];
    setValue("payment_methods", newMethods, { shouldValidate: true });
  };

  const onSubmit = async (values: CourtFormData) => {
    setLoading(true);

    try {
      const url = mode === "create" ? "/api/courts" : `/api/courts/${courtId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save court");
      }

      toast.success(
        mode === "create"
          ? "Court submitted! It is pending admin approval."
          : "Court updated successfully!"
      );

      if (isAdmin) {
        router.push("/admin/courts");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info Card */}
            <Card className="rounded-[32px] border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-linear-to-br from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl">General Info</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                  Basic details about your sporting venue
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-blue-500" /> Court Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Elite Basketball Hub"
                          {...field}
                          className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />{" "}
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about the court, lighting, surface type..."
                          className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all min-h-[120px] pt-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" /> Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Sport Avenue"
                            {...field}
                            className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" /> City
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Casablanca"
                            {...field}
                            className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Sports Card */}
            <div className="space-y-8">
              <Card className="rounded-[32px] border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-linear-to-br from-emerald-500 to-teal-600 p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl">Pricing & Fees</CardTitle>
                  </div>
                  <CardDescription className="text-emerald-50">
                    Set your rates and accepted payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField
                    control={control}
                    name="price_per_hour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-500" />{" "}
                          Price per Hour ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-12 text-lg font-bold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel className="text-sm font-bold">
                      Payment Methods
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {["cash", "card"].map((method) => {
                        const isSelected = paymentMethods.includes(method);
                        return (
                          <div
                            key={method}
                            onClick={() => togglePaymentMethod(method)}
                            className={cn(
                              "flex items-center justify-center gap-2 cursor-pointer rounded-2xl border-2 p-4 font-bold capitalize transition-all duration-300",
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md transform scale-[1.02]"
                                : "border-gray-100 bg-gray-50/50 text-gray-400 hover:border-gray-200"
                            )}
                          >
                            {method === "cash" ? "💵" : "💳"} {method}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-linear-to-br from-orange-500 to-rose-600 p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl">
                      Sports Categories
                    </CardTitle>
                  </div>
                  <CardDescription className="text-orange-50">
                    Select the sports available at this venue
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-2">
                    {SPORTS_OPTIONS.map((sport) => {
                      const id = sport.toLowerCase();
                      const isSelected = selectedSports.includes(id);
                      return (
                        <div
                          key={sport}
                          onClick={() => toggleSport(id)}
                          className={cn(
                            "cursor-pointer rounded-2xl border-2 p-3 text-center text-sm font-bold transition-all duration-300",
                            isSelected
                              ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                              : "border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200"
                          )}
                        >
                          {sport}
                        </div>
                      );
                    })}
                  </div>
                  {errors.sports && (
                    <p className="text-sm font-bold text-rose-500 mt-3 flex items-center gap-1">
                      <Info className="w-4 h-4" /> {errors.sports.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dimensions Card */}
          {selectedSports.length > 0 && (
            <Card className="rounded-[32px] border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-linear-to-br from-purple-600 to-indigo-700 p-8 text-white text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl">Court Dimensions</CardTitle>
                </div>
                <CardDescription className="text-purple-100">
                  Specify width and length for each selected sport in meters
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedSports.map((sportId) => (
                    <div
                      key={sportId}
                      className="space-y-4 p-6 rounded-[24px] bg-gray-50/50 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-8 bg-purple-500 rounded-full" />
                        <p className="text-lg font-bold capitalize text-gray-800">
                          {sportId}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Width (m)
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={currentSize[sportId]?.width || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setValue(`size.${sportId}.width`, val, {
                                shouldValidate: true,
                              });
                            }}
                            className="h-12 rounded-xl border-gray-100 bg-white font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Length (m)
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={currentSize[sportId]?.length || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setValue(`size.${sportId}.length`, val, {
                                shouldValidate: true,
                              });
                            }}
                            className="h-12 rounded-xl border-gray-100 bg-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities Card */}
          <Card className="rounded-[32px] border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-linear-to-br from-gray-700 to-gray-900 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl">
                  Amenities & Facilities
                </CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Additional services and features at your venue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AMENITIES_OPTIONS.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <div
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer rounded-xl border p-4 text-sm font-bold transition-all duration-300",
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white shadow-lg transform scale-[1.02]"
                          : "border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                      {amenity}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full text-xl py-8 rounded-[24px] bg-linear-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                  <span>
                    {mode === "create"
                      ? "Submitting Venue..."
                      : "Updating Venue..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>
                    {mode === "create"
                      ? "Submit Court for Approval"
                      : "Save All Changes"}
                  </span>
                </div>
              )}
            </Button>
            {mode === "create" && (
              <FormDescription className="text-center text-gray-400 font-bold flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Professional review within 24
                hours
              </FormDescription>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
