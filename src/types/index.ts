import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Court = Database["public"]["Tables"]["courts"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];

export interface CourtImage {
  id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface CourtAvailability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export type CourtWithDetails = Court & {
  profiles: Profile | null;
  court_images: CourtImage[];
  reviews: Review[];
  court_availability: CourtAvailability[];
};
