import { z } from "zod";

// Court size validation per sport
export const courtSizeValidation = {
  basketball: { minWidth: 15, minLength: 28 },
  football: { minWidth: 45, minLength: 90 },
  tennis: { minWidth: 10.97, minLength: 23.77 },
  volleyball: { minWidth: 9, minLength: 18 },
  badminton: { minWidth: 6.1, minLength: 13.4 },
  padel: { minWidth: 10, minLength: 20 },
} as const;

// Max players per sport
export const maxPlayersPerSport = {
  basketball: 12,
  football: 18,
  tennis: 4,
  volleyball: 12,
  badminton: 4,
  padel: 4,
} as const;

// Court Schema
export const courtSchema = z.object({
  name: z.string().min(3, "Court name must be at least 3 characters"),
  description: z.string().optional(),
  sports: z.array(z.string()).min(1, "Select at least one sport"),
  size: z.record(
    z.string(),
    z.object({
      width: z.number().positive(),
      length: z.number().positive(),
    })
  ),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  price_per_hour: z.number().positive("Price must be positive"),
  amenities: z.array(z.string()).optional(),
  payment_methods: z
    .array(z.string())
    .min(1, "Select at least one payment method"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CourtFormData = z.infer<typeof courtSchema>;

// Booking Schema
export const bookingSchema = z.object({
  court_id: z.string().uuid(),
  team_id: z.string().uuid().optional(),
  booking_date: z.string().refine((date) => new Date(date) >= new Date(), {
    message: "Booking date must be in the future",
  }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  sport: z.string().min(1, "Sport is required"),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Team Schema
export const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  sport: z.string().min(1, "Sport is required"),
  description: z.string().optional(),
  max_players: z.number().int().positive().max(50),
  looking_for_players: z.boolean(),
  players_needed: z.number().int().min(0),
});

export type TeamFormData = z.infer<typeof teamSchema>;

// Profile Schema
export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  favorite_sports: z.array(z.string()).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Settings Schema
export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.string().default("en"),
  timezone: z.string().default("UTC"),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  bookingReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Review Schema
export const reviewSchema = z.object({
  court_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
