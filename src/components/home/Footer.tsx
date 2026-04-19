"use client";

import Link from "next/link";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";

const footerGroups = {
  Explore: [
    { label: "Find courts", href: "/courts" },
    { label: "Browse teams", href: "/teams" },
    { label: "List your court", href: "/courts/submit" },
  ],
  Account: [
    { label: "Log in", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
  ],
  Product: [
    { label: "Court management", href: "/admin" },
    { label: "Notifications", href: "/admin/notifications" },
    { label: "Settings", href: "/admin/settings" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card/60">
      <div className="page-shell gap-12 pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <p className="brand-wordmark text-3xl font-semibold text-foreground">Courtly</p>
                <p className="text-sm text-muted-foreground">Premium athletic booking and team ops.</p>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Search high-quality venues, keep your team organized, and run the session with one
              reliable operating layer.
            </p>

            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-primary" />
                Cairo, Egypt
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-primary" />
                <a href="mailto:hello@courtly.com" className="transition-colors hover:text-foreground">
                  hello@courtly.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-primary" />
                <a href="tel:+201234567890" className="transition-colors hover:text-foreground">
                  +20 123 456 7890
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerGroups).map(([group, links]) => (
              <div key={group} className="space-y-4">
                <p className="section-kicker text-[0.68rem]">{group}</p>
                <div className="flex flex-col gap-3">
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Courtly. Built for recurring play.</p>
          <div className="flex items-center gap-4">
            <span>English</span>
            <span>EGP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
