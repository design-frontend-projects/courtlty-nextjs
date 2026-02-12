import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { availabilitySchema } from "@/lib/validations/schemas";

// GET - Fetch all availability slots for a court
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courtId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_availability")
    .select("*")
    .eq("court_id", courtId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ availability: data });
}

// POST - Create a new availability slot
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courtId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user owns the court or is admin
  const { data: court } = await supabase
    .from("courts")
    .select("owner_id")
    .eq("id", courtId)
    .single();

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwner = court.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "You can only manage availability for your own courts" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const validation = availabilitySchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 },
    );
  }

  const { day_of_week, start_time, end_time, is_available } = validation.data;

  // Check for overlapping slots
  const { data: existing } = await supabase
    .from("court_availability")
    .select("id")
    .eq("court_id", courtId)
    .eq("day_of_week", day_of_week)
    .or(`and(start_time.lt.${end_time},end_time.gt.${start_time})`);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "This time slot overlaps with an existing availability" },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("court_availability")
    .insert({
      court_id: courtId,
      day_of_week,
      start_time,
      end_time,
      is_available,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ availability: data }, { status: 201 });
}

// PUT - Update an availability slot
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courtId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { availability_id, ...dataToValidate } = body;

  if (!availability_id) {
    return NextResponse.json(
      { error: "availability_id is required" },
      { status: 400 },
    );
  }

  const validation = availabilitySchema.partial().safeParse(dataToValidate);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 },
    );
  }

  const validatedData = validation.data;

  // Check if user owns the court or is admin
  const { data: court } = await supabase
    .from("courts")
    .select("owner_id")
    .eq("id", courtId)
    .single();

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwner = court.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "You can only manage availability for your own courts" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("court_availability")
    .update({
      ...validatedData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", availability_id)
    .eq("court_id", courtId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ availability: data });
}

// DELETE - Delete an availability slot
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courtId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const availabilityId = searchParams.get("availability_id");

  if (!availabilityId) {
    return NextResponse.json(
      { error: "availability_id is required" },
      { status: 400 },
    );
  }

  // Check if user owns the court or is admin
  const { data: court } = await supabase
    .from("courts")
    .select("owner_id")
    .eq("id", courtId)
    .single();

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwner = court.owner_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "You can only manage availability for your own courts" },
      { status: 403 },
    );
  }

  const { error } = await supabase
    .from("court_availability")
    .delete()
    .eq("id", availabilityId)
    .eq("court_id", courtId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Availability slot deleted" });
}
