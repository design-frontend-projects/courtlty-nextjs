"use client";

import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Redirect admin users away from login page
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && profile?.role === "admin") {
          router.replace("/admin");
        } else if (!error) {
          router.replace("/dashboard");
        }
      }
    };
    checkAdmin();
  }, [supabase, router]);

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
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error, data: user } = await supabase.auth.verifyOtp(
        method === "email"
          ? { email, token: otp, type: "email" }
          : { phone, token: otp, type: "sms" },
      );
      console.log("user data after login", user.user);

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.user?.id)
        .single();
      console.log("after login role is");
      console.log(profile);

      if (!profileError && profile?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden selection:bg-blue-500/30">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-emerald-600/20 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Back to Home Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="absolute -top-14 left-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Back to Home</span>
        </Button>

        <Card className="border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-3xl bg-slate-900/60 overflow-hidden rounded-[2.5rem]">
          <CardHeader className="text-center pt-10 pb-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="mx-auto w-16 h-16 bg-linear-to-tr from-blue-500 via-indigo-600 to-emerald-500 rounded-2xl mb-6 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
            >
              <span className="text-white font-black text-3xl">C</span>
            </motion.div>
            <CardTitle className="text-4xl font-black tracking-tight text-white mb-2">
              Courtly
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg font-medium">
              Join the game, make history.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOTP}
                  className="space-y-6"
                >
                  <Tabs
                    defaultValue="email"
                    onValueChange={(v) => setMethod(v as "email" | "phone")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/5 h-14">
                      <TabsTrigger
                        value="email"
                        className="rounded-xl font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger
                        value="phone"
                        className="rounded-xl font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Phone
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                      <TabsContent value="email" className="space-y-4 m-0">
                        <div className="space-y-3">
                          <Label
                            htmlFor="email"
                            className="text-sm font-bold uppercase tracking-widest text-slate-400 pl-1"
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
                            className="h-14 px-5 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="phone" className="space-y-4 m-0">
                        <div className="space-y-3">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-bold uppercase tracking-widest text-slate-400 pl-1"
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
                            className="h-14 px-5 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono"
                          />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg font-black bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] rounded-2xl transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                      "Send Access Code"
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <Label className="text-2xl font-black text-white block">
                        Verifying {method}
                      </Label>
                      <p className="text-slate-400 font-medium pt-1">
                        Enter the code sent to your{" "}
                        {method === "email" ? "inbox" : "phone"}
                      </p>
                    </div>

                    <div className="relative group">
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={10}
                        className="h-20 text-center text-4xl font-black tracking-[0.6em] bg-white/5 border-white/10 rounded-[1.5rem] text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                        placeholder="000000"
                        autoFocus
                      />
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-linear-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-lg font-black bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] rounded-2xl transition-all"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        "Confirm & Sign In"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOtpSent(false)}
                      className="w-full h-12 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Change {method}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="bg-white/[0.02] py-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex gap-4 opacity-40">
              <div className="h-1 w-8 bg-blue-500 rounded-full" />
              <div className="h-1 w-8 bg-emerald-500 rounded-full" />
              <div className="h-1 w-8 bg-indigo-500 rounded-full" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              The Athlete&apos;s Sanctuary
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
