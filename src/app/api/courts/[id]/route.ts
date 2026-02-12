import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { courtSchema } from "@/lib/validations/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select(
      `
      *,
       court_images (
        id,
        url,
        is_primary,
        display_order
      ),
      court_availability (
        id,
        day_of_week,
        start_time,
        end_time,
        is_available
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ court: data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminOrModerator =
    profile?.role === "admin" || profile?.role === "moderator";

  const { data: court } = await supabase
    .from("courts")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  if (court.owner_id !== user.id && !isAdminOrModerator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const validation = courtSchema.partial().safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 },
    );
  }

  const validatedData = validation.data;
  const updateData: any = { ...validatedData };

  // Allow admins/moderators to update status and is_active
  if (isAdminOrModerator) {
    if (
      body.status &&
      ["approved", "pending", "rejected"].includes(body.status)
    ) {
      updateData.status = body.status;
    }
    if (typeof body.is_active === "boolean") {
      updateData.is_active = body.is_active;
    }
  }

  // Ensure there is something to update
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided for update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("courts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ court: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminOrModerator =
    profile?.role === "admin" || profile?.role === "moderator";

  const { data: court } = await supabase
    .from("courts")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  if (court.owner_id !== user.id && !isAdminOrModerator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("courts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
