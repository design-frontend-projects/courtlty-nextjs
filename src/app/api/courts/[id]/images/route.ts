import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch all images for a court
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courtId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_images")
    .select("*")
    .eq("court_id", courtId)
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

// POST - Add a new court image
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
      { error: "You can only manage images for your own courts" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { url, is_primary = false, display_order = 0 } = body;

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // If setting as primary, unset other primaries first
  if (is_primary) {
    await supabase
      .from("court_images")
      .update({ is_primary: false })
      .eq("court_id", courtId);
  }

  const { data, error } = await supabase
    .from("court_images")
    .insert({
      court_id: courtId,
      url,
      is_primary,
      display_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ image: data }, { status: 201 });
}

// PUT - Update a court image (set primary, change order)
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
  const { image_id, is_primary, display_order } = body;

  if (!image_id) {
    return NextResponse.json(
      { error: "image_id is required" },
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
      { error: "You can only manage images for your own courts" },
      { status: 403 },
    );
  }

  // If setting as primary, unset other primaries first
  if (is_primary) {
    await supabase
      .from("court_images")
      .update({ is_primary: false })
      .eq("court_id", courtId);
  }

  const updateData: Record<string, unknown> = {};
  if (is_primary !== undefined) updateData.is_primary = is_primary;
  if (display_order !== undefined) updateData.display_order = display_order;

  const { data, error } = await supabase
    .from("court_images")
    .update(updateData)
    .eq("id", image_id)
    .eq("court_id", courtId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ image: data });
}

// DELETE - Delete a court image
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
  const imageId = searchParams.get("image_id");

  if (!imageId) {
    return NextResponse.json(
      { error: "image_id is required" },
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
      { error: "You can only manage images for your own courts" },
      { status: 403 },
    );
  }

  // Get the image URL to delete from storage
  const { data: image } = await supabase
    .from("court_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (image?.url) {
    // Extract file path from URL and delete from storage
    try {
      const url = new URL(image.url);
      const pathParts = url.pathname.split("/storage/v1/object/public/");
      if (pathParts.length > 1) {
        const [bucket, ...fileParts] = pathParts[1].split("/");
        const filePath = fileParts.join("/");
        await supabase.storage.from(bucket).remove([filePath]);
      }
    } catch {
      // Ignore storage deletion errors, continue with DB deletion
      console.error("Failed to delete image from storage");
    }
  }

  const { error } = await supabase
    .from("court_images")
    .delete()
    .eq("id", imageId)
    .eq("court_id", courtId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Image deleted" });
}
