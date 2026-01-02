export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      courts: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          price_per_hour: number;
          sports: string[];
          amenities: string[];
          payment_methods: string[];
          images: string[] | null;
          owner_id: string;
          is_active: boolean;
          status: "pending" | "approved" | "rejected";
          size: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price_per_hour: number;
          sports?: string[];
          amenities?: string[];
          payment_methods?: string[];
          images?: string[] | null;
          owner_id?: string;
          is_active?: boolean;
          status?: "pending" | "approved" | "rejected";
          size?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price_per_hour?: number;
          sports?: string[];
          amenities?: string[];
          payment_methods?: string[];
          images?: string[] | null;
          owner_id?: string;
          is_active?: boolean;
          status?: "pending" | "approved" | "rejected";
          size?: Json | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          role: "user" | "admin" | "moderator";
          phone: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          role?: "user" | "admin" | "moderator";
          phone?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          role?: "user" | "admin" | "moderator";
          phone?: string | null;
        };
      };
      court_availability: {
        Row: {
          id: string;
          court_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          day_of_week?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          court_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      court_images: {
        Row: {
          id: string;
          court_id: string;
          url: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          url: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          url?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
    };
  };
}
