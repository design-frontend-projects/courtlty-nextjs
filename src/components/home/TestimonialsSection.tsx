"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";

export default function TestimonialsSection() {
  const { t } = useI18n();

  const testimonials = [
    {
      name: t("home.testimonials.items.aName", "Ahmed Hassan"),
      role: t("home.testimonials.items.aRole", "Basketball captain"),
      quote: t(
        "home.testimonials.items.aQuote",
        "We stopped juggling chats, screenshots, and separate payment reminders. Courtly gave the whole session one control room.",
      ),
    },
    {
      name: t("home.testimonials.items.sName", "Sarah Mitchell"),
      role: t("home.testimonials.items.sRole", "Tennis regular"),
      quote: t(
        "home.testimonials.items.sQuote",
        "The difference is speed. I can find a court, confirm a slot, and bring doubles together without getting lost in the flow.",
      ),
    },
    {
      name: t("home.testimonials.items.mName", "Mohamed Ali"),
      role: t("home.testimonials.items.mRole", "Football team manager"),
      quote: t(
        "home.testimonials.items.mQuote",
        "Our squad finally has a clean system for approvals, match planning, and session details. It feels built for actual weekly play.",
      ),
    },
  ];

  return (
    <section className="py-22">
      <div className="page-shell gap-10 pt-0">
        <div className="flex flex-col gap-4">
          <p className="section-kicker">{t("home.testimonials.kicker", "Player feedback")}</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="section-title max-w-2xl">
              {t("home.testimonials.title", "Built for people who need the session to happen on time.")}
            </h2>
            <p className="section-copy">
              {t(
                "home.testimonials.copy",
                "The product earns trust when it removes friction from the last mile: finding a court, confirming who is in, and making the match feel locked.",
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="surface-panel rounded-[1.85rem] px-6 py-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-base leading-7 text-foreground/88">&ldquo;{testimonial.quote}&rdquo;</p>
                </div>
                <Quote className="size-9 text-primary/25" />
              </div>

              <div className="mt-6 border-t border-border/70 pt-4">
                <p className="font-display text-xl font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

