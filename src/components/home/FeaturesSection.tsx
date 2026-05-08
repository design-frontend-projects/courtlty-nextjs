"use client";

import { motion } from "framer-motion";
import { BellRing, CalendarClock, MapPinned, ShieldCheck, Users, WalletCards } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";

export default function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    {
      icon: MapPinned,
      title: t("home.features.items.discoveryTitle", "Discovery that feels local"),
      description: t(
        "home.features.items.discoveryDescription",
        "Search by city, sport, and price without losing the fast scan of court quality.",
      ),
    },
    {
      icon: CalendarClock,
      title: t("home.features.items.bookingTitle", "Booking built for momentum"),
      description: t(
        "home.features.items.bookingDescription",
        "Schedule time slots quickly, confirm availability, and keep payment tied to the booking flow.",
      ),
    },
    {
      icon: Users,
      title: t("home.features.items.squadsTitle", "Recruit and manage squads"),
      description: t(
        "home.features.items.squadsDescription",
        "Run open roster spots, member approvals, and team chat from the same operator surface.",
      ),
    },
    {
      icon: WalletCards,
      title: t("home.features.items.paymentTitle", "Clear payment state"),
      description: t(
        "home.features.items.paymentDescription",
        "Keep totals, confirmations, and receipts visible so players know the booking is locked.",
      ),
    },
    {
      icon: BellRing,
      title: t("home.features.items.remindersTitle", "Reminders that reduce drop-off"),
      description: t(
        "home.features.items.remindersDescription",
        "Give players the session status they need without burying core actions under notification clutter.",
      ),
    },
    {
      icon: ShieldCheck,
      title: t("home.features.items.trustTitle", "Trust at decision points"),
      description: t(
        "home.features.items.trustDescription",
        "Use proof, operator clarity, and consistent UI states to keep bookings credible.",
      ),
    },
  ];

  return (
    <section className="border-b border-border/60 py-22">
      <div className="page-shell gap-10 pt-0">
        <div className="flex flex-col gap-4">
          <p className="section-kicker">{t("home.features.kicker", "How Courtly works")}</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="section-title max-w-2xl">
              {t("home.features.title", "One platform for venue search, booking, and team operations.")}
            </h2>
            <p className="section-copy">
              {t(
                "home.features.copy",
                "The product should feel sharp enough for operators and clear enough for casual players. Each workflow is reduced to the few decisions that actually move a session forward.",
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="surface-panel flex flex-col gap-5 rounded-[1.75rem] px-6 py-6"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-2xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

