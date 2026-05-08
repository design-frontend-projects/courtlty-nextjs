import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";

type Dictionary = Record<string, unknown>;

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

export function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;

  return template.replace(/\{(.*?)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

export function getMessage(
  dict: Dictionary,
  key: string,
  fallback?: string,
  values?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let node: unknown = dict;

  for (const part of parts) {
    if (!node || typeof node !== "object" || !(part in node)) {
      return interpolate(fallback ?? key, values);
    }

    node = (node as Record<string, unknown>)[part];
  }

  if (typeof node !== "string") {
    return interpolate(fallback ?? key, values);
  }

  return interpolate(node, values);
}

