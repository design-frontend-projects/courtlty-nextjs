import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminCourtsClient from "./courts-client";

export default async function AdminCourtsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: courts, error } = await supabase.from("courts").select("*");
  console.log("courts", courts);

  if (error) {
    console.error("Error fetching courts:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Court Management
          </h1>
          <p className="text-muted-foreground">
            Manage all courts, approvals, and listings.
          </p>
        </div>
      </div>
      <AdminCourtsClient initialCourts={courts || []} />
    </div>
  );
}
