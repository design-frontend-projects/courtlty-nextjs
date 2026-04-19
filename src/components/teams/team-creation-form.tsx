"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { teamSchema, type TeamFormData } from "@/lib/validations/schemas";
import { getMaxPlayersForSport } from "@/lib/utils/business-logic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SPORTS_OPTIONS = ["Basketball", "Football", "Tennis", "Volleyball", "Badminton", "Padel"];

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
  const maxPlayersAllowed = selectedSport ? getMaxPlayersForSport(selectedSport) : 50;

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    setValue("sport", sport);
    setValue("max_players", getMaxPlayersForSport(sport));
  };

  const onSubmit = async (data: TeamFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create team");
      }

      toast.success("Team created successfully.");
      router.push(`/teams/${result.team.id}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="name" className="section-kicker text-[0.68rem]">
          Team name
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Example: Downtown Wednesday Club"
          className="h-12 rounded-2xl"
        />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-3">
        <Label className="section-kicker text-[0.68rem]">Sport</Label>
        <div className="flex flex-wrap gap-2">
          {SPORTS_OPTIONS.map((sport) => {
            const value = sport.toLowerCase();
            const active = selectedSport === value;
            return (
              <button
                key={sport}
                type="button"
                onClick={() => handleSportChange(value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>
        {errors.sport ? <p className="text-sm text-destructive">{errors.sport.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description" className="section-kicker text-[0.68rem]">
          Team description
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Explain the squad style, match rhythm, and who should join."
          className="min-h-32 rounded-[1.5rem]"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="max_players" className="section-kicker text-[0.68rem]">
            Maximum players
          </Label>
          <Input
            id="max_players"
            {...register("max_players", { valueAsNumber: true })}
            type="number"
            min="1"
            max={maxPlayersAllowed}
            className="h-12 rounded-2xl"
          />
          <p className="text-sm text-muted-foreground">
            {selectedSport ? `Up to ${maxPlayersAllowed} players for ${selectedSport}.` : "Select a sport to set the recommended roster size."}
          </p>
          {errors.max_players ? (
            <p className="text-sm text-destructive">{errors.max_players.message}</p>
          ) : null}
        </div>

        <div className="surface-panel rounded-[1.6rem] px-5 py-5">
          <div className="flex items-start gap-3">
            <Checkbox id="looking_for_players" {...register("looking_for_players")} />
            <div className="grid gap-1">
              <Label htmlFor="looking_for_players">Open recruitment</Label>
              <p className="text-sm text-muted-foreground">
                Show that the team is actively looking for new players.
              </p>
            </div>
          </div>

          {lookingForPlayers ? (
            <div className="mt-4 grid gap-2">
              <Label htmlFor="players_needed" className="section-kicker text-[0.68rem]">
                Players needed
              </Label>
              <Input
                id="players_needed"
                {...register("players_needed", { valueAsNumber: true })}
                type="number"
                min="0"
                className="h-12 rounded-2xl"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-border/70 bg-accent/22 px-5 py-4">
        <div className="space-y-1">
          <p className="section-kicker text-[0.68rem]">Team setup</p>
          <p className="text-sm text-muted-foreground">Courtly will create the roster shell and redirect you to the team workspace.</p>
        </div>
        {selectedSport ? (
          <Badge variant="secondary" className="rounded-full capitalize">
            {selectedSport}
          </Badge>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="rounded-full px-6" disabled={loading}>
          {loading ? "Creating team..." : "Create team"}
        </Button>
      </div>
    </form>
  );
}
