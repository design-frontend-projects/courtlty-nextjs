export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "player" | "court_owner" | "admin";
          favorite_sports: string[] | null;
          notification_preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "player" | "court_owner" | "admin";
          favorite_sports?: string[] | null;
          notification_preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "player" | "court_owner" | "admin";
          favorite_sports?: string[] | null;
          notification_preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courts: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string | null;
          sports: string[];
          size: Json | null;
          address: string | null;
          city: string | null;
          location: unknown | null;
          price_per_hour: number | null;
          amenities: string[] | null;
          status: "pending" | "approved" | "rejected";
          payment_methods: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string | null;
          sports: string[];
          size?: Json | null;
          address?: string | null;
          city?: string | null;
          location?: unknown | null;
          price_per_hour?: number | null;
          amenities?: string[] | null;
          status?: "pending" | "approved" | "rejected";
          payment_methods?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          description?: string | null;
          sports?: string[];
          size?: Json | null;
          address?: string | null;
          city?: string | null;
          location?: unknown | null;
          price_per_hour?: number | null;
          amenities?: string[] | null;
          status?: "pending" | "approved" | "rejected";
          payment_methods?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          owner_id: string | null;
          sport: string;
          description: string | null;
          logo_url: string | null;
          max_players: number;
          looking_for_players: boolean;
          players_needed: number;
          weekly_wins: number;
          total_games: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id?: string | null;
          sport: string;
          description?: string | null;
          logo_url?: string | null;
          max_players?: number;
          looking_for_players?: boolean;
          players_needed?: number;
          weekly_wins?: number;
          total_games?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string | null;
          sport?: string;
          description?: string | null;
          logo_url?: string | null;
          max_players?: number;
          looking_for_players?: boolean;
          players_needed?: number;
          weekly_wins?: number;
          total_games?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          court_id: string | null;
          booked_by: string | null;
          team_id: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          sport: string;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          total_amount: number;
          payment_status: "pending" | "paid" | "refunded";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          court_id?: string | null;
          booked_by?: string | null;
          team_id?: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          sport: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          total_amount: number;
          payment_status?: "pending" | "paid" | "refunded";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string | null;
          booked_by?: string | null;
          team_id?: string | null;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          sport?: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed";
          total_amount?: number;
          payment_status?: "pending" | "paid" | "refunded";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "player" | "court_owner" | "admin";
      court_status: "pending" | "approved" | "rejected";
      booking_status: "pending" | "confirmed" | "cancelled" | "completed";
      payment_status: "pending" | "paid" | "refunded";
    };
  };
};
