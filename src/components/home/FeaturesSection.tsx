"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  CreditCard,
  MapPin,
  Bell,
  Shield,
  Star,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Booking",
    description:
      "Find and book sports courts in your area with just a few clicks. Real-time availability and instant confirmation.",
    gradient: "from-emerald-500 to-cyan-500",
    bgGradient: "from-emerald-500/10 to-cyan-500/10",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Create your team, invite players, and manage your squad. Find teams looking for players or recruit for yours.",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10",
    shadowColor: "shadow-violet-500/20",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Pay individually or split costs with your team. Support for both card and cash payments with secure transactions.",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
    shadowColor: "shadow-amber-500/20",
  },
  {
    icon: MapPin,
    title: "Location Discovery",
    description:
      "Explore courts on an interactive map. Filter by sport, distance, and amenities to find the perfect venue.",
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-500/10 to-pink-500/10",
    shadowColor: "shadow-rose-500/20",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Get reminders for upcoming games, booking confirmations, and team updates. Never miss a match again.",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Your data is protected with enterprise-grade security. Trusted by thousands of players worldwide.",
    gradient: "from-teal-500 to-emerald-500",
    bgGradient: "from-teal-500/10 to-emerald-500/10",
    shadowColor: "shadow-teal-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              Play
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Our platform provides all the tools you need to book courts, manage
            teams, and organize games effortlessly.
          </motion.p>
        </div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 group-hover:border-transparent group-hover:shadow-xl">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.shadowColor} shadow-lg mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
                  >
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
