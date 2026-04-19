"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && profile?.role === "admin") {
        router.replace("/admin");
        return;
      }

      router.replace("/dashboard");
    };

    void checkSession();
  }, [router, supabase]);

  const handleSendOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (method === "email") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: { shouldCreateUser: true },
        });

        if (error) {
          throw error;
        }
      }

      setOtpSent(true);
      toast.success("Access code sent");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.verifyOtp(
        method === "email"
          ? { email, token: otp, type: "email" }
          : { phone, token: otp, type: "sms" },
      );

      if (error) {
        throw error;
      }

      const userId = data.user?.id;

      if (!userId) {
        throw new Error("No authenticated user returned");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!profileError && profile?.role === "admin") {
        router.replace("/admin");
        return;
      }

      router.replace("/dashboard");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to verify code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="app-grid absolute inset-0 opacity-35" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute left-[-12rem] top-12 size-[28rem] rounded-full bg-primary/12 blur-3xl" />
      <div className="absolute bottom-[-14rem] right-[-10rem] size-[30rem] rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Home
            </Link>
          </Button>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Premium athletic access
          </Badge>
        </div>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <div className="surface-panel-strong max-w-3xl overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-8 lg:min-h-[33rem] lg:justify-between">
                <div className="space-y-4">
                  <p className="section-kicker">Courtly access</p>
                  <div className="space-y-4">
                    <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                      Book faster. Organize better. Stay game ready.
                    </h1>
                    <p className="max-w-lg text-base leading-7 text-muted-foreground">
                      One sign-in gets you from discovery to booking, team coordination, and
                      operator tools without switching mental gears.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: Sparkles,
                      title: "Faster access",
                      copy: "Email or phone OTP with no password friction.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Role-aware routing",
                      copy: "Admins land in review mode, players land in their workspace.",
                    },
                    {
                      icon: TimerReset,
                      title: "Low-noise flow",
                      copy: "Clear state changes from request to verification.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.5rem] border border-border/70 bg-background/78 px-4 py-4 backdrop-blur"
                    >
                      <item.icon className="mb-4 size-5 text-primary" />
                      <h2 className="font-display text-xl font-semibold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: reduceMotion ? 0 : 0.08 }}
            className="mx-auto flex w-full max-w-xl flex-col gap-4"
          >
            <Card className="surface-panel border-border/70 py-0 shadow-xl">
              <CardHeader className="border-b border-border/70 px-6 py-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="section-kicker">Sign in</p>
                    <CardTitle className="text-3xl font-semibold tracking-tight">
                      Enter Courtly
                    </CardTitle>
                    <CardDescription className="max-w-md text-sm leading-6">
                      Use the delivery channel that gets you into the booking flow fastest.
                    </CardDescription>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-[1.1rem] border border-primary/20 bg-primary/10 font-display text-lg font-semibold text-primary">
                    C
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6 sm:px-8">
                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.form
                      key="request-code"
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      onSubmit={handleSendOTP}
                      className="flex flex-col gap-6"
                    >
                      <Tabs
                        value={method}
                        onValueChange={(value) => setMethod(value as "email" | "phone")}
                        className="w-full"
                      >
                        <TabsList className="grid h-12 w-full grid-cols-2 rounded-full border border-border/80 bg-accent/35 p-1">
                          <TabsTrigger value="email" className="rounded-full">
                            <Mail data-icon="inline-start" />
                            Email
                          </TabsTrigger>
                          <TabsTrigger value="phone" className="rounded-full">
                            <Phone data-icon="inline-start" />
                            Phone
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="email" className="mt-5">
                          <div className="flex flex-col gap-3">
                            <Label htmlFor="email" className="text-sm font-medium">
                              Work email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
                              placeholder="player@courtly.com"
                              required
                              className="h-12 rounded-2xl"
                            />
                            <p className="text-sm leading-6 text-muted-foreground">
                              Best for desktop access and longer operator sessions.
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="phone" className="mt-5">
                          <div className="flex flex-col gap-3">
                            <Label htmlFor="phone" className="text-sm font-medium">
                              Mobile number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(event) => setPhone(event.target.value)}
                              placeholder="+20 100 000 0000"
                              required
                              className="h-12 rounded-2xl"
                            />
                            <p className="text-sm leading-6 text-muted-foreground">
                              Best when you need to jump from discovery to booking quickly.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <Button type="submit" disabled={loading} className="h-12 rounded-full">
                        {loading ? <Loader2 className="animate-spin" /> : "Send access code"}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="verify-code"
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      onSubmit={handleVerifyOTP}
                      className="flex flex-col gap-6"
                    >
                      <div className="space-y-2">
                        <p className="section-kicker">Verify code</p>
                        <h2 className="font-display text-2xl font-semibold tracking-tight">
                          Check your {method === "email" ? "inbox" : "messages"}
                        </h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Enter the code sent to {method === "email" ? email : phone}.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Label htmlFor="otp" className="text-sm font-medium">
                          One-time passcode
                        </Label>
                        <Input
                          id="otp"
                          type="text"
                          autoFocus
                          maxLength={10}
                          value={otp}
                          onChange={(event) => setOtp(event.target.value)}
                          placeholder="000000"
                          required
                          className="h-14 rounded-[1.35rem] text-center font-display text-3xl tracking-[0.35em]"
                        />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button type="submit" disabled={loading} className="h-12 flex-1 rounded-full">
                          {loading ? <Loader2 className="animate-spin" /> : "Confirm and continue"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          className="h-12 rounded-full"
                        >
                          Change method
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
