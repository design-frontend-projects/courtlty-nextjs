import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "./dashboard-client";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: pendingCourts },
    { count: courtsCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase
      .from("courts")
      .select("*, profiles(full_name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("courts").select("*", { count: "exact", head: true }),
    supabase.from("auth.users").select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminDashboardClient
      pendingCourts={pendingCourts || []}
      stats={{
        totalCourts: courtsCount || 0,
        totalUsers: usersCount || 0,
        pendingCount: pendingCourts?.length || 0,
      }}
    />
  );
}
