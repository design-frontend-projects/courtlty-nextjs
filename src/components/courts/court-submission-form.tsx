"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { courtSchema, type CourtFormData } from "@/lib/validations/schemas";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export default function CourtSubmissionForm() {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["cash"]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      price_per_hour: 0,
    },
  });

  const { setValue } = form;

  const toggleSport = (sport: string) => {
    const newSports = selectedSports.includes(sport)
      ? selectedSports.filter((s) => s !== sport)
      : [...selectedSports, sport];
    setSelectedSports(newSports);
    setValue("sports", newSports, { shouldValidate: true });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(newAmenities);
    setValue("amenities", newAmenities);
  };

  const togglePaymentMethod = (method: string) => {
    const newMethods = paymentMethods.includes(method)
      ? paymentMethods.filter((m) => m !== method)
      : [...paymentMethods, method];
    setPaymentMethods(newMethods);
    setValue("payment_methods", newMethods, { shouldValidate: true });
  };

  const onSubmit = async (data: CourtFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/courts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          sports: selectedSports,
          amenities: selectedAmenities,
          payment_methods: paymentMethods,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit court");
      }

      toast.success("Court submitted! It is pending admin approval.");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Downtown Sports Arena"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your court facilities..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sports Selection */}
              <div className="space-y-3">
                <FormLabel>Available Sports</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPORTS_OPTIONS.map((sport) => {
                    const isSelected = selectedSports.includes(
                      sport.toLowerCase()
                    );
                    return (
                      <div
                        key={sport}
                        onClick={() => toggleSport(sport.toLowerCase())}
                        className={cn(
                          "cursor-pointer rounded-md border-2 p-4 text-center text-sm font-semibold transition-all hover:bg-accent",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted bg-transparent text-muted-foreground"
                        )}
                      >
                        {sport}
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.sports && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.sports.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price_per_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Hour ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50.00"
                        min={0}
                        step={0.01}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amenities */}
              <div className="space-y-3">
                <FormLabel>Amenities</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <Badge
                        key={amenity}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1 text-sm md:text-base hover:bg-primary/80 hover:text-primary-foreground"
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <FormLabel>Payment Methods</FormLabel>
                <div className="flex gap-4">
                  {["cash", "card"].map((method) => {
                    const isSelected = paymentMethods.includes(method);
                    return (
                      <div
                        key={method}
                        onClick={() => togglePaymentMethod(method)}
                        className={cn(
                          "flex-1 cursor-pointer rounded-md border-2 p-4 text-center font-semibold capitalize transition-all hover:bg-accent",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted bg-transparent text-muted-foreground"
                        )}
                      >
                        {method === "cash" ? "💵" : "💳"} {method}
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.payment_methods && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.payment_methods.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-lg py-6"
              disabled={loading}
              size="lg"
            >
              {loading ? "Submitting..." : "Submit Court for Approval"}
            </Button>
            <FormDescription className="text-center">
              Your court will be reviewed by our admin team before going live
            </FormDescription>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
