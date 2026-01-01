"use client";

import { useState } from "react";
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
import { CreditCard, Lock, CheckCircle2, Download } from "lucide-react";
import { format } from "date-fns";

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

  const handlePay = async () => {
    await onConfirm();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simple formatting for simulation
    let val = e.target.value.replace(/\D/g, "");
    val = val.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(val.slice(0, 19));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isProcessing && !isSuccess && onClose()}
    >
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            {isSuccess ? (
              <span className="text-green-600">Payment Successful!</span>
            ) : (
              "Secure Checkout"
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Your booking has been confirmed. You can now download your receipt."
              : "Complete your booking securely below."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-gray-600">
              Thank you for booking <strong>{bookingDetails.courtName}</strong>{" "}
              on {format(new Date(bookingDetails.date), "PPP")}.
            </p>
            <Button
              onClick={onDownloadReceipt}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold gap-2"
            >
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-2 border border-blue-100 dark:border-blue-900/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Court</span>
                <span className="font-bold">{bookingDetails.courtName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-bold">
                  {format(new Date(bookingDetails.date), "MMM d")} •{" "}
                  {bookingDetails.time}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center mt-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-xl font-black text-blue-600">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="0000 0000 0000 0000"
                    className="pl-10 h-11 rounded-xl"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input
                    placeholder="MM/YY"
                    className="h-11 rounded-xl"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="123"
                      type="password"
                      className="pl-10 h-11 rounded-xl"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center bg-green-50 dark:bg-green-900/10 p-2 rounded-lg text-green-700 dark:text-green-400">
              <Lock className="h-3 w-3" />
              Payments are secure and encrypted
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between px-0">
          {!isSuccess && (
            <>
              <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                onClick={handlePay}
                disabled={isProcessing || !cardNumber || !expiry || !cvc}
                className="bg-blue-600 hover:bg-blue-700 font-bold px-8 rounded-xl"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  `Pay $${amount.toFixed(2)}`
                )}
              </Button>
            </>
          )}
          {isSuccess && (
            <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
