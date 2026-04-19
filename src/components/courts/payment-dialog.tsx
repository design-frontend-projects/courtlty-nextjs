"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, CreditCard, Download, Lock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  amount: number;
  bookingDetails: {
    courtName: string;
    date: string;
    time: string;
  };
  isProcessing: boolean;
  isSuccess: boolean;
  onDownloadReceipt: () => void;
}

export function PaymentDialog({
  isOpen,
  onClose,
  onConfirm,
  amount,
  bookingDetails,
  isProcessing,
  isSuccess,
  onDownloadReceipt,
}: PaymentDialogProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(value.slice(0, 19));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && !isProcessing && onClose()}>
      <DialogContent className="rounded-[2rem] p-7 sm:max-w-xl">
        <DialogHeader className="gap-3">
          <DialogTitle className="font-display text-3xl font-semibold tracking-tight">
            {isSuccess ? "Booking confirmed" : "Complete payment"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6">
            {isSuccess
              ? "The booking is locked. Download the receipt or close this dialog to return to your dashboard."
              : "Review the session details and confirm payment to finalize the booking."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="grid gap-5 py-3">
            <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-emerald-500/18 bg-emerald-500/8 px-6 py-10 text-center">
              <div className="rounded-full border border-emerald-500/18 bg-emerald-500/12 p-4 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-2">
                <p className="font-display text-2xl font-semibold">{bookingDetails.courtName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(bookingDetails.date), "PPP")} at {bookingDetails.time}
                </p>
              </div>
            </div>
            <Button onClick={onDownloadReceipt} className="h-12 rounded-full">
              <Download data-icon="inline-start" />
              Download receipt
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 py-2">
            <div className="surface-panel rounded-[1.75rem] px-5 py-5">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Court</span>
                  <span className="font-medium text-foreground">{bookingDetails.courtName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Session</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(bookingDetails.date), "PPP")} at {bookingDetails.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
                  <span className="section-kicker text-[0.68rem]">Total</span>
                  <span className="font-display text-3xl font-semibold text-primary">${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cardNumber">Card number</Label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    placeholder="MM/YY"
                    className="h-12 rounded-2xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="cvc"
                      type="password"
                      value={cvc}
                      onChange={(event) => setCvc(event.target.value)}
                      placeholder="123"
                      className="h-12 rounded-2xl pl-11"
                    />
                  </div>
                </div>
              </div>

              <p className="rounded-2xl border border-border/70 bg-accent/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
                Demo checkout only. Payment is simulated, but the booking confirmation flow matches the real session path.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          {!isSuccess ? (
            <>
              <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="rounded-full">
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isProcessing || !cardNumber || !expiry || !cvc}
                className="rounded-full px-6"
              >
                {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="w-full rounded-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
