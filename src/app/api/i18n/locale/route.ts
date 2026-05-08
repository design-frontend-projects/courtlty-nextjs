import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/types";

type LocalePayload = {
  locale?: string;
};

export async function POST(request: Request) {
  let locale: Locale = DEFAULT_LOCALE;

  try {
    const body = (await request.json()) as LocalePayload;
    const parsed = normalizeLocale(body?.locale);
    if (parsed) {
      locale = parsed;
    }
  } catch {
    // Keep default locale when payload is missing/malformed.
  }

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      await supabase.from("settings").upsert(
        {
          user_id: user.id,
          language: locale,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }
  } catch {
    // Cookie persistence is enough; DB sync is best-effort.
  }

  return response;
}

