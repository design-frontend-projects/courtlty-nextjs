"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Settings2,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useI18n } from "@/components/providers/i18n-provider";

const managementItems = [
  {
    titleKey: "admin.sidebar.bookings",
    fallbackTitle: "Bookings hub",
    url: "/admin",
    icon: CalendarDays,
    match: (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/bookings"),
  },
  {
    titleKey: "admin.sidebar.approvals",
    fallbackTitle: "Approvals",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname.startsWith("/admin/dashboard"),
  },
  {
    titleKey: "admin.sidebar.courts",
    fallbackTitle: "Courts",
    url: "/admin/courts",
    icon: Trophy,
    match: (pathname: string) => pathname.startsWith("/admin/courts"),
  },
  {
    titleKey: "admin.sidebar.payments",
    fallbackTitle: "Payments",
    url: "/admin/payments",
    icon: CreditCard,
    match: (pathname: string) => pathname.startsWith("/admin/payments"),
  },
  {
    titleKey: "admin.sidebar.notifications",
    fallbackTitle: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
    match: (pathname: string) => pathname.startsWith("/admin/notifications"),
  },
] as const;

const accountItems = [
  {
    titleKey: "admin.sidebar.profile",
    fallbackTitle: "Profile",
    url: "/admin/profile",
    icon: UserRound,
    match: (pathname: string) => pathname.startsWith("/admin/profile"),
  },
  {
    titleKey: "admin.sidebar.settings",
    fallbackTitle: "Settings",
    url: "/admin/settings",
    icon: Settings2,
    match: (pathname: string) => pathname.startsWith("/admin/settings"),
  },
] as const;

export function AdminSidebar() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-none">
      <SidebarHeader className="px-3 py-4">
        <Link href="/admin" className="operator-panel-strong block px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1rem] border border-primary/20 bg-primary/10 font-display text-lg font-semibold text-primary">
              C
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold tracking-tight text-sidebar-foreground">
                Courtly Admin
              </p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-sidebar-foreground/60">
                {t("admin.suiteTagline", "Operator suite")}
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>{t("admin.operations", "Operations")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.fallbackTitle}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={item.match(pathname)}
                    tooltip={t(item.titleKey, item.fallbackTitle)}
                    className="rounded-xl"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey, item.fallbackTitle)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t("admin.account", "Account")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.fallbackTitle}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.match(pathname)}
                    tooltip={t(item.titleKey, item.fallbackTitle)}
                    className="rounded-xl"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey, item.fallbackTitle)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <div className="rounded-[1.2rem] border border-sidebar-border/80 bg-sidebar-accent/60 px-4 py-4 text-sm leading-6 text-sidebar-foreground/70">
          {t(
            "admin.footerCopy",
            "Keep approvals, payouts, and venue quality in one high-clarity workspace.",
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

