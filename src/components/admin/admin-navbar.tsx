"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Profile } from "@/types";

export function AdminNavbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold hidden md:block">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        ) : profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border-2 border-indigo-100">
                  <AvatarImage
                    src={profile.avatar_url || ""}
                    alt={profile.full_name || ""}
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700">
                    {profile.full_name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile.full_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            className="rounded-full bg-black text-white hover:bg-gray-800"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
