import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function CourtsPage() {
  const supabase = await createClient();

  const { data: courts } = await supabase
    .from("courts")
    .select(
      `
      *,
      court_images (
        url,
        is_primary
      ),
      profiles!courts_owner_id_fkey (
        full_name
      )
    `
    )
    .eq("status", "approved")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Discover Courts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Find the perfect court for your next game
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Dashboard
            </Link>
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
              <option value="badminton">Badminton</option>
              <option value="padel">Padel</option>
            </select>

            <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Cities</option>
            </select>

            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Courts Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courts && courts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court: any) => {
              const primaryImage = court.court_images?.find(
                (img: any) => img.is_primary
              );
              return (
                <Link
                  key={court.id}
                  href={`/courts/${court.id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={court.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                        {court.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {court.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {court.address}, {court.city}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {court.sports?.slice(0, 3).map((sport: string) => (
                        <span
                          key={sport}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${court.price_per_hour}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          per hour
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No courts available at the moment
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
