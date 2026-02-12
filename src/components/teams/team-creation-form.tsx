"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema, type TeamFormData } from "@/lib/validations/schemas";
import { getMaxPlayersForSport } from "@/lib/utils/business-logic";
import { toast } from "sonner";

const SPORTS_OPTIONS = [
  "Basketball",
  "Football",
  "Tennis",
  "Volleyball",
  "Badminton",
  "Padel",
];

export default function TeamCreationForm() {
  const [selectedSport, setSelectedSport] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      looking_for_players: false,
      players_needed: 0,
    },
  });

  const lookingForPlayers = watch("looking_for_players");
  const maxPlayersAllowed = selectedSport
    ? getMaxPlayersForSport(selectedSport)
    : 50;

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    setValue("sport", sport);
    const maxPlayers = getMaxPlayersForSport(sport);
    setValue("max_players", maxPlayers);
  };

  const onSubmit = async (data: TeamFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create team");
      }

      toast.success("Team created successfully!");
      router.push(`/teams/${result.team.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6"
    >
      {/* Team Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Team Name *
        </label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Thunder Squad"
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Sport Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sport *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPORTS_OPTIONS.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => handleSportChange(sport.toLowerCase())}
              className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                selectedSport === sport.toLowerCase()
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
        {errors.sport && (
          <p className="text-red-600 text-sm mt-1">{errors.sport.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell others about your team..."
        />
      </div>

      {/* Max Players */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum Players *
        </label>
        <input
          {...register("max_players", { valueAsNumber: true })}
          type="number"
          min="1"
          max={maxPlayersAllowed}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Max ${maxPlayersAllowed} for ${
            selectedSport || "this sport"
          }`}
        />
        {errors.max_players && (
          <p className="text-red-600 text-sm mt-1">
            {errors.max_players.message}
          </p>
        )}
        {selectedSport && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Maximum allowed for {selectedSport}: {maxPlayersAllowed} players
          </p>
        )}
      </div>

      {/* Looking for Players */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("looking_for_players")}
            type="checkbox"
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Looking for players
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Let others know youre recruiting
            </p>
          </div>
        </label>

        {lookingForPlayers && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How many players needed?
            </label>
            <input
              {...register("players_needed", { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? "Creating Team..." : "Create Team"}
        </button>
      </div>
    </form>
  );
}
