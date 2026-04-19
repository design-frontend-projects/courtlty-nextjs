"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CalendarIcon, Clock, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { bookingSchema, type BookingFormData } from "@/lib/validations/schemas";
import { generateReceiptPDF } from "@/lib/pdf/receipt-generator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PaymentDialog } from "./payment-dialog";

interface BookingFormProps {
  courtId: string;
  courtName: string;
  sports: string[];
  pricePerHour: number;
}

export default function BookingForm({
  courtId,
  courtName,
  sports,
  pricePerHour,
}: BookingFormProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastBookingId, setLastBookingId] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      court_id: courtId,
      sport: sports[0] || "",
      booking_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "19:00",
      end_time: "20:30",
    },
  });

  const { watch, setValue } = form;
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  const calculateTotalAmount = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) return 0;
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours * pricePerHour);
  };

  const totalAmount = calculateTotalAmount();

  const handlePaymentConfirm = async () => {
    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      const data = form.getValues();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in to book a court.");
        router.push(`/login?redirect=/courts/${courtId}`);
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          total_amount: totalAmount,
          payment_status: "paid",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create booking");

      setLastBookingId(result.id || "ID-123456");
      setPaymentSuccess(true);
      toast.success("Booking confirmed.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      setPaymentProcessing(false);
    }
  };

  const handleDownloadReceipt = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    generateReceiptPDF({
      bookingId: lastBookingId,
      courtName,
      sport: form.getValues().sport,
      date: form.getValues().booking_date,
      startTime: form.getValues().start_time,
      endTime: form.getValues().end_time,
      pricePerHour,
      totalAmount,
      userName: user?.user_metadata?.full_name || user?.email || "Guest User",
    });
  };

  const handleClose = () => {
    setShowPayment(false);
    if (paymentSuccess) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => setShowPayment(true))} className="grid gap-5">
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="section-kicker text-[0.68rem]">Sport</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-2xl">
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="section-kicker text-[0.68rem]">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 justify-between rounded-2xl px-4 text-left font-medium",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                        <CalendarIcon className="size-4 text-muted-foreground" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto rounded-[1.5rem] p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => date && setValue("booking_date", format(date, "yyyy-MM-dd"))}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="p-4"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="section-kicker text-[0.68rem]">Start</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="time" {...field} className="h-12 rounded-2xl pl-11" />
                    </div>
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
                  <FormLabel className="section-kicker text-[0.68rem]">End</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="time" {...field} className="h-12 rounded-2xl pl-11" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="surface-panel rounded-[1.75rem] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="section-kicker text-[0.68rem]">Booking total</p>
                <p className="font-display text-4xl font-semibold text-primary">${totalAmount.toFixed(2)}</p>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                ${pricePerHour}/hour
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Includes the selected session length. Payment confirmation will generate the receipt.
            </p>
          </div>

          <Button type="submit" className="h-12 rounded-full text-base" disabled={totalAmount <= 0}>
            <ReceiptText data-icon="inline-start" />
            Continue to payment
          </Button>
        </form>
      </Form>

      <PaymentDialog
        isOpen={showPayment}
        onClose={handleClose}
        onConfirm={handlePaymentConfirm}
        amount={totalAmount}
        bookingDetails={{
          courtName,
          date: form.getValues().booking_date,
          time: `${startTime} - ${endTime}`,
        }}
        isProcessing={paymentProcessing}
        isSuccess={paymentSuccess}
        onDownloadReceipt={handleDownloadReceipt}
      />
    </div>
  );
}
