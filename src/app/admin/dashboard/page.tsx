import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "./dashboard-client";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch pending courts
  const { data: pendingCourts } = await supabase
    .from("courts")
    .select("*, profiles(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch stats (optional, but nice)
  const { count: courtsCount } = await supabase
    .from("courts")
    .select("*", { count: "exact", head: true });

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

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
