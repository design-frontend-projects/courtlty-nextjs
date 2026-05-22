import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const AVATARS_BUCKET = "avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.trim().toLowerCase();
  if (fromName) {
    return fromName;
  }

  const mimeExtension = file.type.split("/").pop()?.trim().toLowerCase();
  return mimeExtension || "jpg";
}

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return parsedUrl.pathname.slice(markerIndex + marker.length);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!fileEntry.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please upload a valid image file" }, { status: 400 });
  }

  if (fileEntry.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image size must be less than 5MB" }, { status: 400 });
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const fileExtension = getFileExtension(fileEntry);
  const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, fileEntry, {
      cacheControl: "3600",
      upsert: false,
      contentType: fileEntry.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    await supabase.storage.from(AVATARS_BUCKET).remove([filePath]);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const previousAvatarPath = getStoragePathFromPublicUrl(currentProfile.avatar_url);
  if (previousAvatarPath && previousAvatarPath !== filePath) {
    await supabase.storage.from(AVATARS_BUCKET).remove([previousAvatarPath]);
  }

  return NextResponse.json({ avatarUrl: publicUrl });
}
