import { Database } from "./database.types";

export type Court = Database["public"]["Tables"]["courts"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CourtAvailability =
  Database["public"]["Tables"]["court_availability"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type CourtImage = Database["public"]["Tables"]["court_images"]["Row"];

export interface CourtWithDetails extends Court {
  court_images: CourtImage[];
  court_availability: CourtAvailability[];
  reviews: Review[];
  profiles: Pick<Profile, "full_name" | "phone" | "avatar_url"> | null;
}
