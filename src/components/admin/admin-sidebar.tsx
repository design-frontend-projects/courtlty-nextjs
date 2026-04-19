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

const managementItems = [
  {
    title: "Bookings hub",
    url: "/admin",
    icon: CalendarDays,
    match: (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/bookings"),
  },
  {
    title: "Approvals",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname.startsWith("/admin/dashboard"),
  },
  {
    title: "Courts",
    url: "/admin/courts",
    icon: Trophy,
    match: (pathname: string) => pathname.startsWith("/admin/courts"),
  },
  {
    title: "Payments",
    url: "/admin/payments",
    icon: CreditCard,
    match: (pathname: string) => pathname.startsWith("/admin/payments"),
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
    match: (pathname: string) => pathname.startsWith("/admin/notifications"),
  },
];

const accountItems = [
  {
    title: "Profile",
    url: "/admin/profile",
    icon: UserRound,
    match: (pathname: string) => pathname.startsWith("/admin/profile"),
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings2,
    match: (pathname: string) => pathname.startsWith("/admin/settings"),
  },
];

export function AdminSidebar() {
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
                Operator suite
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={item.match(pathname)}
                    tooltip={item.title}
                    className="rounded-xl"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.match(pathname)}
                    tooltip={item.title}
                    className="rounded-xl"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
          Keep approvals, payouts, and venue quality in one high-clarity workspace.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
