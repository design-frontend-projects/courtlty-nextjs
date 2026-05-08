export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE_NAME = "courtlty_locale";

export const LOCALE_DIRECTIONS: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const compact = value.trim().toLowerCase();
  if (isLocale(compact)) return compact;

  // Accept regional forms such as en-US / ar-EG.
  const root = compact.split("-")[0];
  return isLocale(root) ? root : null;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return LOCALE_DIRECTIONS[locale];
}

