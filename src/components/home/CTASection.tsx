"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

export default function CTASection() {
  const { t } = useI18n();

  return (
    <section className="py-16">
      <div className="page-shell pt-0">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
          className="surface-panel-strong grid gap-6 bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(16,185,129,0.08))] px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div className="flex flex-col gap-3">
            <p className="section-kicker">{t("home.cta.kicker", "Start now")}</p>
            <h2 className="section-title max-w-2xl">
              {t(
                "home.cta.title",
                "Make the next match easier to book, easier to organize, and harder to drop.",
              )}
            </h2>
            <p className="section-copy">
              {t("home.cta.copy", "Courtly is built for recurring sports sessions, not one-off booking widgets.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href="/login?tab=signup">
                {t("home.cta.createAccount", "Create your account")}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6">
              <Link href="/courts">{t("home.cta.browseCourts", "Browse courts")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

