import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeamCreationForm from "@/components/teams/team-creation-form";

export default async function CreateTeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already owns a team
  const { data: existingTeam } = await supabase
    .from("teams")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (existingTeam) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            You Already Own a Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You can only own one team at a time. Manage your existing team:{" "}
            <strong>{existingTeam.name}</strong>
          </p>
          <a
            href={`/teams/${existingTeam.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            View My Team
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build your squad and start playing together
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamCreationForm />
      </main>
    </div>
  );
}
