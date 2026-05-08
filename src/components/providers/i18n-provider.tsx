"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getMessage } from "@/lib/i18n/messages";
import { getDirection, type Locale } from "@/lib/i18n/types";

type Messages = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  isSwitchingLocale: boolean;
  t: (key: string, fallback?: string, values?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  initialLocale,
  messages,
  children,
}: {
  initialLocale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSwitchingLocale, setIsSwitchingLocale] = useState(false);

  const t = useCallback(
    (key: string, fallback?: string, values?: Record<string, string | number>) =>
      getMessage(messages, key, fallback, values),
    [messages],
  );

  const setLocale = useCallback(
    async (locale: Locale) => {
      setIsSwitchingLocale(true);
      try {
        const response = await fetch("/api/i18n/locale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale }),
        });

        if (!response.ok) {
          throw new Error("Unable to switch locale");
        }

        router.refresh();
      } finally {
        setIsSwitchingLocale(false);
      }
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: initialLocale,
      direction: getDirection(initialLocale),
      isSwitchingLocale,
      t,
      setLocale,
    }),
    [initialLocale, isSwitchingLocale, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

