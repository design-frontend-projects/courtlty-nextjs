import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select(
      `
      *,
      profiles!teams_owner_id_fkey (
        full_name,
        avatar_url
      ),
      team_members (
        id,
        profiles!team_members_player_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Browse Teams
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Find a team or create your own
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/teams/create"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Team
              </Link>
              <Link
                href="/dashboard"
                className="text-blue-600 dark:text-blue-400 hover:underline px-6 py-3"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4 flex-wrap">
            <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Sports</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="tennis">Tennis</option>
              <option value="volleyball">Volleyball</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span>Looking for players</span>
            </label>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team: any) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-32 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="w-20 h-20 rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-gray-800">
                      {team.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {team.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {team.sport}
                  </p>

                  {team.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {team.team_members?.length || 0}
                      </span>
                      /{team.max_players} players
                    </div>
                    {team.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {team.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {team.looking_for_players && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                        🔍 Looking for {team.players_needed} player(s)
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {team.profiles?.full_name?.charAt(0) || "O"}
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          Owner
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {team.profiles?.full_name || "Team Owner"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No teams available yet
            </p>
            <Link
              href="/teams/create"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Create the First Team
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
