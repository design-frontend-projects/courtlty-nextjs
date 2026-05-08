"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Globe2, LogOut, Settings2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/components/providers/i18n-provider";

const routeMeta = [
  {
    match: (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/bookings"),
    titleKey: "admin.route.bookingsTitle",
    descriptionKey: "admin.route.bookingsDescription",
    fallbackTitle: "Bookings hub",
    fallbackDescription: "Calendar, requests, and session changes.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/admin/dashboard"),
    titleKey: "admin.route.approvalsTitle",
    descriptionKey: "admin.route.approvalsDescription",
    fallbackTitle: "Approvals",
    fallbackDescription: "Venue submissions, growth signals, and fast decisions.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/admin/courts"),
    titleKey: "admin.route.courtsTitle",
    descriptionKey: "admin.route.courtsDescription",
    fallbackTitle: "Courts",
    fallbackDescription: "Venue inventory, listing health, and status control.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/admin/payments"),
    titleKey: "admin.route.paymentsTitle",
    descriptionKey: "admin.route.paymentsDescription",
    fallbackTitle: "Payments",
    fallbackDescription: "Settlement visibility and transaction oversight.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/admin/notifications"),
    titleKey: "admin.route.notificationsTitle",
    descriptionKey: "admin.route.notificationsDescription",
    fallbackTitle: "Notifications",
    fallbackDescription: "System-wide and targeted operator communication.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/admin/profile"),
    titleKey: "admin.route.profileTitle",
    descriptionKey: "admin.route.profileDescription",
    fallbackTitle: "Profile",
    fallbackDescription: "Identity and account-level operating preferences.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/admin/settings"),
    titleKey: "admin.route.settingsTitle",
    descriptionKey: "admin.route.settingsDescription",
    fallbackTitle: "Settings",
    fallbackDescription: "Environment defaults, alerts, and privacy controls.",
  },
] as const;

export function AdminNavbar() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUserData(user);

        if (!user) {
          setProfile(null);
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(data);
      } catch (error) {
        console.error("Error fetching admin user", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [supabase]);

  const currentRoute =
    routeMeta.find((item) => item.match(pathname)) || routeMeta[0];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(t("admin.toasts.signedOut", "Signed out"));
      router.push("/login");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("admin.toasts.signOutError", "Error signing out"));
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/86 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="rounded-full border border-border/70" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight">
                {t(currentRoute.titleKey, currentRoute.fallbackTitle)}
              </h1>
              <Badge variant="secondary" className="rounded-full">
                {t("admin.operatorMode", "Operator mode")}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {t(currentRoute.descriptionKey, currentRoute.fallbackDescription)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="h-9 rounded-full" />
          <Button asChild variant="outline" className="hidden rounded-full md:inline-flex">
            <Link href="/">
              <Globe2 data-icon="inline-start" />
              {t("admin.liveSite", "Live site")}
            </Link>
          </Button>

          {loading ? (
            <div className="size-10 animate-pulse rounded-full bg-accent/50" />
          ) : userData ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 rounded-full px-2">
                  <Avatar className="size-9 border border-border/70">
                    <AvatarImage
                      src={profile?.avatar_url || userData.user_metadata.avatar_url || ""}
                      alt={profile?.full_name || userData.email || "Admin"}
                    />
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {(profile?.full_name || userData.email || "A").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || t("admin.courtlyOperator", "Courtly operator")}
                    </p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <UserRound />
                    {t("common.profile", "Profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings2 />
                    {t("common.settings", "Settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut />
                  {t("common.logout", "Log out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="rounded-full">
              <Link href="/login">{t("common.login", "Log in")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

