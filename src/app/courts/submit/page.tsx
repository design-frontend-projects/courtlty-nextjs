import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CourtSubmissionForm from "@/components/courts/court-submission-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SubmitCourtPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="operator-panel flex w-full max-w-md flex-col gap-4 px-7 py-8 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Only court owners can submit courts. Please contact support to
            upgrade your account.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell-tight">
      <header className="operator-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Submit Your Court
          </h1>
          <p className="text-sm text-muted-foreground">
            List your court and start accepting bookings
          </p>
        </div>
      </header>

      <main>
        <CourtSubmissionForm />
      </main>
    </div>
  );
}
