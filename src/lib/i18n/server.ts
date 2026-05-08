import { cookies } from "next/headers";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { getDictionary, getMessage } from "@/lib/i18n/messages";
import {
  DEFAULT_LOCALE,
  getDirection,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/types";

export async function resolveRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  if (cookieLocale) {
    return cookieLocale;
  }

  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const { data } = await supabase
        .from("settings")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();

      const dbLocale = normalizeLocale(data?.language);
      if (dbLocale) {
        return dbLocale;
      }
    }
  } catch {
    // Localization should not block page rendering.
  }

  return DEFAULT_LOCALE;
}

export async function getServerI18n() {
  const locale = await resolveRequestLocale();
  const messages = getDictionary(locale);

  return {
    locale,
    direction: getDirection(locale),
    messages,
    t: (key: string, fallback?: string, values?: Record<string, string | number>) =>
      getMessage(messages, key, fallback, values),
  };
}

