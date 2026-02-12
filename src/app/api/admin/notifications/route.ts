import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const notificationSchema = z.object({
  userId: z.string().uuid().optional(), // Optional, if null/undefined -> broadcast? Or maybe require "all" flag
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  sendToAll: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = notificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { userId, title, message, type, sendToAll } = validation.data;

    if (sendToAll) {
      // Fetch all users
      // Note: fetching all profiles to get user IDs.
      // In a large system, this should be done differently (e.g. background job).
      // For this scale, it's acceptable.
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id");

      if (profilesError) {
        return NextResponse.json(
          { error: "Failed to fetch users" },
          { status: 500 },
        );
      }

      const notifications = profiles.map((p) => ({
        user_id: p.id,
        title,
        message,
        type,
        is_read: false,
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) {
        return NextResponse.json(
          { error: "Failed to send notifications" },
          { status: 500 },
        );
      }
    } else if (userId) {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      });

      if (error) {
        return NextResponse.json(
          { error: "Failed to send notification" },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "User ID or Send to All required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Notification Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
