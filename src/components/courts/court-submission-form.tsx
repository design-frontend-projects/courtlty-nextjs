"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { courtSchema, type CourtFormData } from "@/lib/validations/schemas";
import { Court } from "@/types";
import { CourtMap } from "@/components/courts/CourtMap";
import CourtImageUploader from "@/components/admin/courts/court-image-uploader";
import CourtAvailabilityManager from "@/components/admin/courts/court-availability-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const SPORTS_OPTIONS = ["basketball", "football", "tennis", "volleyball", "badminton", "padel"] as const;
const PAYMENT_OPTIONS = ["cash", "card"] as const;
const AMENITIES_OPTIONS = [
  "Parking",
  "Changing Rooms",
  "Showers",
  "Lockers",
  "Lighting",
  "Seating",
  "Water Fountain",
  "First Aid",
] as const;

interface AvailabilitySlot {
  id: string;
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface CourtImageData {
  id: string;
  court_id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

interface CourtSubmissionFormProps {
  initialData?: Court;
  initialAvailability?: AvailabilitySlot[];
  initialImages?: CourtImageData[];
  mode?: "create" | "edit";
  courtId?: string;
  isAdmin?: boolean;
}

export default function CourtSubmissionForm({
  initialData,
  initialAvailability = [],
  initialImages = [],
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
          size: initialData.size as Record<string, { width: number; length: number }>,
          address: initialData.address || "",
          city: initialData.city || "",
          price_per_hour: initialData.price_per_hour || 0,
          amenities: initialData.amenities || [],
          payment_methods: initialData.payment_methods || ["card"],
          latitude: initialData.latitude ?? undefined,
          longitude: initialData.longitude ?? undefined,
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
          latitude: undefined,
          longitude: undefined,
        },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedSports = watch("sports");
  const watchedAmenities = watch("amenities");
  const watchedPaymentMethods = watch("payment_methods");
  const watchedSize = watch("size");

  const selectedSports = useMemo(() => watchedSports ?? [], [watchedSports]);
  const selectedAmenities = useMemo(() => watchedAmenities ?? [], [watchedAmenities]);
  const paymentMethods = useMemo(() => watchedPaymentMethods ?? [], [watchedPaymentMethods]);
  const currentSize = useMemo(() => watchedSize ?? {}, [watchedSize]);

  useEffect(() => {
    const currentSizeData = {
      ...((currentSize as Record<string, { width: number; length: number }>) || {}),
    };
    let changed = false;

    selectedSports.forEach((sport) => {
      if (!currentSizeData[sport]) {
        currentSizeData[sport] = { width: 0, length: 0 };
        changed = true;
      }
    });

    if (changed) {
      setValue("size", currentSizeData);
    }
  }, [currentSize, selectedSports, setValue]);

  const onSubmit = async (values: CourtFormData) => {
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/courts" : `/api/courts/${courtId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save court");
      }

      toast.success(mode === "create" ? "Court submitted for approval." : "Court updated.");
      router.push(isAdmin ? "/admin/courts" : "/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl pb-16">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Card className="operator-panel">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Core details users see while searching.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Field data-invalid={!!errors.name}>
                        <FieldLabel htmlFor="court-name">Court name</FieldLabel>
                        <FormControl>
                          <Input id="court-name" aria-invalid={!!errors.name} {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <Field data-invalid={!!errors.description}>
                        <FieldLabel htmlFor="court-description">Description</FieldLabel>
                        <FormControl>
                          <Textarea
                            id="court-description"
                            aria-invalid={!!errors.description}
                            {...field}
                            className="min-h-28 rounded-xl"
                          />
                        </FormControl>
                        <FieldDescription>Include surface quality, lighting, and access notes.</FieldDescription>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <Field data-invalid={!!errors.address}>
                          <FieldLabel htmlFor="court-address">Address</FieldLabel>
                          <FormControl>
                            <Input id="court-address" aria-invalid={!!errors.address} {...field} className="h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <Field data-invalid={!!errors.city}>
                          <FieldLabel htmlFor="court-city">City</FieldLabel>
                          <FormControl>
                            <Input id="court-city" aria-invalid={!!errors.city} {...field} className="h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="operator-panel">
            <CardHeader>
              <CardTitle>Pricing and Availability</CardTitle>
              <CardDescription>Set hourly rate and supported payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FormField
                  control={control}
                  name="price_per_hour"
                  render={({ field }) => (
                    <FormItem>
                      <Field data-invalid={!!errors.price_per_hour}>
                        <FieldLabel htmlFor="price-per-hour">Price per hour (USD)</FieldLabel>
                        <FormControl>
                          <InputGroup className="rounded-xl" aria-invalid={!!errors.price_per_hour}>
                            <InputGroupAddon>$</InputGroupAddon>
                            <InputGroupInput
                              id="price-per-hour"
                              type="number"
                              inputMode="decimal"
                              aria-invalid={!!errors.price_per_hour}
                              value={field.value ?? ""}
                              onChange={(event) => field.onChange(Number(event.target.value || 0))}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <Field data-invalid={!!errors.payment_methods}>
                  <FieldSet>
                    <FieldLegend>Payment methods</FieldLegend>
                    <ToggleGroup
                      type="multiple"
                      value={paymentMethods}
                      onValueChange={(value) => setValue("payment_methods", value, { shouldValidate: true })}
                      className="flex h-auto w-full flex-wrap gap-2 bg-transparent p-0"
                    >
                      {PAYMENT_OPTIONS.map((method) => (
                        <ToggleGroupItem
                          key={method}
                          value={method}
                          className="h-10 rounded-full border border-input px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          {method}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FieldSet>
                  {errors.payment_methods?.message ? <FieldError>{errors.payment_methods.message}</FieldError> : null}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="operator-panel">
            <CardHeader>
              <CardTitle>Sports and Dimensions</CardTitle>
              <CardDescription>Choose supported sports and set dimensions for each.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <Field data-invalid={!!errors.sports}>
                <FieldSet>
                  <FieldLegend>Sports</FieldLegend>
                  <ToggleGroup
                    type="multiple"
                    value={selectedSports}
                    onValueChange={(value) => setValue("sports", value, { shouldValidate: true })}
                    className="flex h-auto w-full flex-wrap gap-2 bg-transparent p-0"
                  >
                    {SPORTS_OPTIONS.map((sport) => (
                      <ToggleGroupItem
                        key={sport}
                        value={sport}
                        className="h-10 rounded-full border border-input px-4 capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {sport}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FieldSet>
                {errors.sports?.message ? <FieldError>{errors.sports.message}</FieldError> : null}
              </Field>

              {selectedSports.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedSports.map((sportId) => (
                    <FieldSet key={sportId} className="rounded-2xl border border-border/70 p-4">
                      <FieldLegend className="mb-2 capitalize">{sportId} dimensions (m)</FieldLegend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor={`width-${sportId}`}>Width</FieldLabel>
                          <Input
                            id={`width-${sportId}`}
                            type="number"
                            value={currentSize[sportId]?.width || ""}
                            onChange={(event) =>
                              setValue(`size.${sportId}.width`, Number(event.target.value || 0), {
                                shouldValidate: true,
                              })
                            }
                            className="h-11 rounded-xl"
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`length-${sportId}`}>Length</FieldLabel>
                          <Input
                            id={`length-${sportId}`}
                            type="number"
                            value={currentSize[sportId]?.length || ""}
                            onChange={(event) =>
                              setValue(`size.${sportId}.length`, Number(event.target.value || 0), {
                                shouldValidate: true,
                              })
                            }
                            className="h-11 rounded-xl"
                          />
                        </Field>
                      </div>
                    </FieldSet>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="operator-panel">
            <CardHeader>
              <CardTitle>Amenities and Location</CardTitle>
              <CardDescription>Select onsite facilities and set exact map coordinates.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <Field>
                <FieldSet>
                  <FieldLegend>Amenities</FieldLegend>
                  <ToggleGroup
                    type="multiple"
                    value={selectedAmenities}
                    onValueChange={(value) => setValue("amenities", value)}
                    className="flex h-auto w-full flex-wrap gap-2 bg-transparent p-0"
                  >
                    {AMENITIES_OPTIONS.map((amenity) => (
                      <ToggleGroupItem
                        key={amenity}
                        value={amenity}
                        className="h-10 rounded-full border border-input px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {amenity}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FieldSet>
              </Field>

              <CourtMap
                isInteractive
                address={`${watch("address") || ""} ${watch("city") || ""}`.trim()}
                defaultLocation={
                  initialData?.latitude && initialData?.longitude
                    ? { lat: initialData.latitude, lng: initialData.longitude }
                    : undefined
                }
                onLocationSelect={(loc) => {
                  setValue("latitude", loc.lat);
                  setValue("longitude", loc.lng);
                }}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel>Latitude</FieldLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} readOnly className="h-11 rounded-xl bg-muted/35" />
                        </FormControl>
                      </Field>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel>Longitude</FieldLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} readOnly className="h-11 rounded-xl bg-muted/35" />
                        </FormControl>
                      </Field>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {mode === "edit" && courtId ? (
            <div className="flex flex-col gap-6">
              <CourtImageUploader courtId={courtId} initialImages={initialImages} />
              <CourtAvailabilityManager courtId={courtId} initialData={initialAvailability} />
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <Button type="submit" className="h-12 rounded-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  {mode === "create" ? "Submitting court..." : "Saving updates..."}
                </>
              ) : mode === "create" ? (
                "Submit Court for Approval"
              ) : (
                "Save Changes"
              )}
            </Button>
            {mode === "create" ? (
              <p className="text-center text-sm text-muted-foreground">
                Submissions are reviewed before they appear in the public directory.
              </p>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
}
