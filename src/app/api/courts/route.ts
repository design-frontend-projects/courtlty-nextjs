import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const city = searchParams.get("city");
  const status = searchParams.get("status") || "approved";

  const supabase = await createClient();

  let query = supabase
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
      profiles!courts_owner_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("status", status)
    .eq("is_active", true);

  if (sport) {
    query = query.contains("sports", [sport]);
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ courts: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("courts")
    .insert({
      ...body,
      owner_id: user.id,
      status: "pending",
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ court: data }, { status: 201 });
}
