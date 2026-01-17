"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated floating orbs background
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradient orbs */}
    <motion.div
      className="absolute top-20 left-[10%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 blur-3xl"
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute top-40 right-[5%] w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-violet-400/25 to-fuchsia-400/25 blur-3xl"
      animate={{
        x: [0, -40, 0],
        y: [0, 50, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
    />
    <motion.div
      className="absolute bottom-20 left-[30%] w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl"
      animate={{
        x: [0, 30, 0],
        y: [0, -40, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
      }}
    />

    {/* Subtle grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
  </div>
);

// Feature pill component
const FeaturePill = ({
  icon: Icon,
  text,
  delay,
}: {
  icon: typeof MapPin;
  text: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20"
  >
    <Icon className="w-4 h-4 text-emerald-500" />
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {text}
    </span>
  </motion.div>
);

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <FloatingOrbs />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              #1 Sports Court Booking Platform
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Book Courts.{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                Build Teams.
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
            <br />
            <span className="text-slate-700 dark:text-slate-300">
              Play Together.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Discover and book sports courts near you, create or join teams, and
            organize games with friends. The ultimate platform for sports
            enthusiasts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/courts">
              <Button
                size="lg"
                className="group h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
              >
                Find Courts Near You
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/teams">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-300"
              >
                Explore Teams
              </Button>
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <FeaturePill icon={MapPin} text="500+ Courts" delay={0.7} />
            <FeaturePill icon={Users} text="10K+ Players" delay={0.8} />
            <FeaturePill icon={Calendar} text="Easy Booking" delay={0.9} />
          </motion.div>
        </div>

        {/* Floating sports icons */}
        <motion.div
          className="hidden lg:block absolute left-[8%] top-[30%]"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30 flex items-center justify-center text-3xl">
            🏀
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:block absolute right-[10%] top-[25%]"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-2xl">
            ⚽
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:block absolute left-[15%] bottom-[15%]"
          animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/30 flex items-center justify-center text-xl">
            🎾
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:block absolute right-[12%] bottom-[20%]"
          animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30 flex items-center justify-center text-2xl">
            🏐
          </div>
        </motion.div>
      </div>
    </section>
  );
}
