import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prizeSchema } from "@/lib/validations/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: prizes, error } = await supabase
      .from("prizes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error fetching prizes:", error);
      return NextResponse.json(
        { error: "Failed to fetch prizes" },
        { status: 500 },
      );
    }

    return NextResponse.json(prizes);
  } catch (error) {
    console.error("Internal Error fetching prizes:", error);
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
    const validatedData = prizeSchema.parse(body);

    const { data: prize, error } = await supabase
      .from("prizes")
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error creating prize:", error);
      return NextResponse.json(
        { error: "Failed to create prize" },
        { status: 500 },
      );
    }

    return NextResponse.json(prize, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Internal Error creating prize:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
