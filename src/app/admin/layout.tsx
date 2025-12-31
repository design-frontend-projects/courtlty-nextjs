import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("role")
  //   .eq("id", user.id)
  //   .single();

  // if (profile?.role !== "admin") {
  //   redirect("/dashboard");
  // }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminNavbar />
        <main className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
