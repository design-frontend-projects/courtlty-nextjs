"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const proofPoints = [
  { label: "Live court inventory", value: "500+" },
  { label: "Active players", value: "10K+" },
  { label: "Weekly team sessions", value: "3.2K" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.36),rgba(15,23,42,0.72)),url('https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(90,126,255,0.42),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,154,0.18),transparent_28%)]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-end gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-18">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl space-y-8"
        >
          <div className="flex flex-wrap items-center gap-3 text-white/78">
            <span className="pill-label border-white/15 bg-white/8 text-white/82">
              Premium athletic booking
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="status-dot" />
              Book, recruit, and play from one flow
            </span>
          </div>

          <div className="space-y-5">
            <p className="section-kicker text-white/70">Courtly</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              Book the court.
              <br />
              Build the squad.
              <br />
              Keep the session moving.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
              Discover high-quality venues, manage your next match, and keep team logistics in one
              sharp, mobile-first workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href="/courts">
                Explore courts
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-white/10 px-6 text-white hover:bg-white/16 hover:text-white dark:border-white/25 dark:bg-white/10 dark:hover:bg-white/16"
            >
              <Link href="/teams">Browse teams</Link>
            </Button>
          </div>

          <div className="grid gap-5 rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md md:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point.label} className="space-y-1">
                <p className="font-display text-3xl font-semibold text-white">{point.value}</p>
                <p className="text-sm text-white/68">{point.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="surface-panel-strong hidden bg-slate-950/35 p-6 text-white lg:flex lg:flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/12 pb-4">
            <div>
              <p className="section-kicker text-white/56">Session board</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Tonight at 7:30 PM</h2>
            </div>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
              Available
            </span>
          </div>

          <div className="grid gap-4 py-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-display text-2xl font-semibold">Cairo Match Court</p>
                  <p className="flex items-center gap-2 text-sm text-white/64">
                    <MapPin className="size-4 text-primary" />
                    Nasr City, Cairo
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/48">Rate</p>
                  <p className="font-display text-2xl font-semibold">$34</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/48">Roster</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-3 text-primary">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold">8 / 10</p>
                    <p className="text-sm text-white/64">Players confirmed</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/48">Schedule</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-3 text-primary">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold">90 min</p>
                    <p className="text-sm text-white/64">Warm-up to final whistle</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm leading-6 text-white/62">
              Courtly keeps search, booking, team status, and reminders on one board so the game
              does not stall between messages.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
