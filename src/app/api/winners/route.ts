import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { weeklyWinnerSchema } from "@/lib/validations/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: winners, error } = await supabase
      .from("weekly_winners")
      .select(
        `
        id,
        rank,
        week_start_date,
        created_at,
        profiles (
          id,
          full_name,
          username,
          avatar_url
        ),
        prizes (
          id,
          title,
          image_url,
          points_cost
        )
      `,
      )
      .order("week_start_date", { ascending: false })
      .order("rank", { ascending: true });

    if (error) {
      console.error("Supabase Error fetching winners:", error);
      return NextResponse.json(
        { error: "Failed to fetch winners" },
        { status: 500 },
      );
    }

    return NextResponse.json(winners);
  } catch (error) {
    console.error("Internal Error fetching winners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin/moderator role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "moderator"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = weeklyWinnerSchema.parse(body);

    const { data: winner, error } = await supabase
      .from("weekly_winners")
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error setting winner:", error);
      return NextResponse.json(
        { error: "Failed to set weekly winner" },
        { status: 500 },
      );
    }

    return NextResponse.json(winner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Internal Error setting winner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
