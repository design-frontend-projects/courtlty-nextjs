"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { bookingSchema, type BookingFormData } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Court, Profile } from "@/types";

interface AdminBookingFormProps {
  courts: Court[];
  users: Profile[];
  initialData?: Partial<BookingFormData> & { status?: string };
  bookingId?: string;
  isEdit?: boolean;
}

export default function AdminBookingForm({
  courts,
  users,
  initialData,
  bookingId,
  isEdit = false,
}: AdminBookingFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: initialData || {
      court_id: "",
      sport: "",
      user_id: "",
      booking_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "09:00",
      end_time: "10:00",
    },
  });

  const { watch, setValue } = form;
  const selectedCourtId = watch("court_id");
  const selectedCourt = courts.find((c) => c.id === selectedCourtId);
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  const calculateTotalAmount = () => {
    if (!selectedCourt || !startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) return 0;
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours * (selectedCourt?.price_per_hour || 0));
  };

  const totalAmount = calculateTotalAmount();

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    try {
      // Validate time logic
      const start = new Date(`2000-01-01T${data.start_time}`);
      const end = new Date(`2000-01-01T${data.end_time}`);
      if (end <= start) {
        toast.error("End time must be after start time");
        return;
      }

      // If user_id is missing during create, error out (unless editing? logic implies admin override)
      if (!isEdit && !data.user_id) {
        toast.error("Please select a user for the booking");
        return;
      }

      const payload = {
        ...data,
        total_amount: totalAmount,
        status: isEdit ? initialData?.status : "confirmed",
      };

      let response;
      if (isEdit && bookingId) {
        response = await fetch(`/api/bookings/${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to save booking");

      toast.success(isEdit ? "Booking updated!" : "Booking created!");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* User Selection - new feature */}
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isEdit} // Maybe disable editing user after creation
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name ||
                          user.username ||
                          user.first_name ||
                          "Unknown User"}{" "}
                        ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Court Selection */}
          <FormField
            control={form.control}
            name="court_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Court</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Reset sport when court changes
                    setValue("sport", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a court" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name} (${court.price_per_hour}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sport Selection (Dependent on Court) */}
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedCourt}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedCourt
                            ? "Select sport"
                            : "Select a court first"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCourt?.sports.map((sport) => (
                      <SelectItem
                        key={sport}
                        value={sport}
                        className="capitalize"
                      >
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="booking_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          date &&
                          setValue("booking_date", format(date, "yyyy-MM-dd"))
                        }
                        initialFocus
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pricing Summary */}
          {selectedCourt && (
            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
              <span className="font-medium text-gray-600">Total Price</span>
              <span className="text-2xl font-bold text-blue-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !selectedCourt}
          >
            {loading
              ? "Processing..."
              : isEdit
                ? "Update Booking"
                : "Create Booking"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
