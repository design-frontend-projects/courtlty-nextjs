import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { courtSchema } from "@/lib/validations/schemas";
import { NextResponse } from "next/server";

const DAY_OF_WEEK_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDayOfWeek(dayOfWeek: number) {
  return DAY_OF_WEEK_LABELS[dayOfWeek] || `Day ${dayOfWeek}`;
}

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const court = await prisma.courts.findUnique({
    where: { id },
    include: {
      profiles: {
        select: {
          id: true,
          full_name: true,
          avatar_url: true,
          phone: true,
        },
      },
      court_images: {
        select: {
          id: true,
          url: true,
          is_primary: true,
          display_order: true,
        },
        orderBy: [{ is_primary: "desc" }, { display_order: "asc" }],
      },
      court_availability: {
        select: {
          id: true,
          day_of_week: true,
          start_time: true,
          end_time: true,
          is_available: true,
        },
        orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,
          profiles: {
            select: {
              full_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  return NextResponse.json({
    court: {
      id: court.id,
      name: court.name,
      description: court.description,
      address: court.address,
      city: court.city,
      price_per_hour: court.price_per_hour ? Number(court.price_per_hour) : 0,
      sports: court.sports || [],
      amenities: court.amenities || [],
      payment_methods: court.payment_methods || [],
      profiles: court.profiles
        ? {
            id: court.profiles.id,
            full_name: court.profiles.full_name,
            avatar_url: court.profiles.avatar_url,
            phone: court.profiles.phone,
          }
        : null,
      court_images: court.court_images.map((image) => ({
        id: image.id,
        url: image.url,
        is_primary: image.is_primary ?? false,
        display_order: image.display_order ?? 0,
      })),
      court_availability: court.court_availability.map((slot) => ({
        id: slot.id,
        day_of_week: formatDayOfWeek(slot.day_of_week),
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time),
        is_available: slot.is_available ?? true,
      })),
      reviews: court.reviews.map((review) => ({
        id: review.id,
        rating: review.rating ?? 0,
        comment: review.comment,
        created_at: review.created_at?.toISOString() || new Date().toISOString(),
        profiles: review.profiles
          ? {
              full_name: review.profiles.full_name,
              avatar_url: review.profiles.avatar_url,
            }
          : null,
      })),
    },
  });
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
  const updateData: Record<string, unknown> = { ...validatedData };

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
