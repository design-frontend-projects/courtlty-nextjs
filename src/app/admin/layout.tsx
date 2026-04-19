import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminNavbar, AdminSidebar } from "@/components/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />
      <SidebarInset className="bg-transparent">
        <div className="relative min-h-screen bg-background">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10rem] top-16 size-[26rem] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-12rem] right-[-10rem] size-[28rem] rounded-full bg-emerald-500/8 blur-3xl" />
          </div>
          <AdminNavbar />
          <main className="relative flex-1 px-4 pb-8 pt-4 md:px-6 lg:px-8">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
