"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (method === "email") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) throw error;
      }
      setOtpSent(true);
    } catch (error: unknown) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp(
        method === "email"
          ? { email, token: otp, type: "email" }
          : { phone, token: otp, type: "sms" }
      );
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">
        <Card className="shadow-2xl border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-linear-to-tr from-blue-600 to-emerald-500 rounded-xl mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-2xl">C</span>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Courtly
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
              Join the game, make history.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <Tabs
                  defaultValue="email"
                  onValueChange={(v) => setMethod(v as "email" | "phone")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (234) 567-890"
                        required
                        className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Send Access Code"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Label
                      htmlFor="otp"
                      className="text-lg font-bold text-slate-900 dark:text-slate-50"
                    >
                      Check your {method}
                    </Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Enter the code we just sent to you.
                    </p>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={10}
                    className="h-16 text-center text-3xl font-black tracking-[0.5em] bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    placeholder="000000"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Confirm & Sign In"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center py-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
              Reliable • Secure • Swift
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
