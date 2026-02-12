import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prizeSchema } from "@/lib/validations/schemas";
import { z } from "zod";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Partial validation for updates
    const validatedData = prizeSchema.partial().parse(body);

    const { data: prize, error } = await supabase
      .from("prizes")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error updating prize:", error);
      return NextResponse.json(
        { error: "Failed to update prize" },
        { status: 500 },
      );
    }

    return NextResponse.json(prize);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Internal Error updating prize:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    const { error } = await supabase.from("prizes").delete().eq("id", id);

    if (error) {
      console.error("Supabase Error deleting prize:", error);
      return NextResponse.json(
        { error: "Failed to delete prize" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Prize deleted successfully" });
  } catch (error) {
    console.error("Internal Error deleting prize:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
