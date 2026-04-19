"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/layout/NotificationBell";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Users,
  Menu,
  MapPin,
} from "lucide-react";

const navLinks = [
  { href: "/courts", label: "Courts", icon: MapPin },
  { href: "/teams", label: "Teams", icon: Users },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [hasTeam, setHasTeam] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { count } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("player_id", user.id);

        const { count: ownedCount } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id);

        setHasTeam((count || 0) > 0 || (ownedCount || 0) > 0);
      }
    };
    getUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  const isWorkspace =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/teams");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/82 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-18 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="brand-wordmark text-2xl font-semibold leading-none text-foreground">
                  Courtly
                </span>
                <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:block">
                  Premium Athletic Booking
                </span>
              </div>
            </Link>
            <div className="hidden md:flex md:items-center md:gap-2">
              {!isWorkspace ? (
                <Link
                  href="/"
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === "/" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Home
                </Link>
              ) : null}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href || pathname.startsWith(`${link.href}/`)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                      pathname.startsWith("/dashboard")
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                      pathname.startsWith("/profile")
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Profile
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email || ""}
                        />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">User</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {hasTeam && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <Users className="mr-2 h-4 w-4" />
                          <span>My Teams</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !isWorkspace ? (
              <div className="hidden items-center space-x-2 sm:flex">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="lg" className="rounded-full px-5">
                  <Link href="/login?tab=signup">
                    Start booking
                    <ChevronRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            ) : null}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                <SheetHeader className="border-b border-border/70 pb-6">
                  <SheetTitle className="brand-wordmark text-3xl font-semibold text-foreground">
                    Courtly
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 py-6">
                  {!isWorkspace ? (
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${
                        pathname === "/" ? "bg-accent text-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Home
                    </Link>
                  ) : null}
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${
                          pathname === link.href || pathname.startsWith(`${link.href}/`)
                            ? "bg-accent text-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${
                          pathname.startsWith("/dashboard") ? "bg-accent text-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors ${
                          pathname.startsWith("/profile") ? "bg-accent text-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <UserIcon className="h-5 w-5" />
                        Profile
                      </Link>
                    </>
                  ) : null}
                </div>

                <div className="border-t border-border/70 pt-6">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            {user.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Logged in
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {hasTeam && (
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium hover:bg-muted transition-colors"
                          >
                            <Users className="h-5 w-5" />
                            My squads
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-medium text-red-600 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut className="h-5 w-5" />
                          Log out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 px-4">
                      <Button asChild className="w-full rounded-full">
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full rounded-full">
                        <Link
                          href="/login?tab=signup"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
