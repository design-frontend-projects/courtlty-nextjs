"use client";

import { Check, Globe2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/components/providers/i18n-provider";
import { type Locale } from "@/lib/i18n/types";

const localeOptions: Array<{ value: Locale; labelKey: string; nativeLabel: string }> = [
  { value: "en", labelKey: "common.english", nativeLabel: "English" },
  { value: "ar", labelKey: "common.arabic", nativeLabel: "???????" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, isSwitchingLocale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className ?? "h-9 rounded-full"}
          disabled={isSwitchingLocale}
          aria-label={t("common.switchLanguage", "Switch language")}
        >
          {isSwitchingLocale ? <Loader2 className="size-4 animate-spin" /> : <Globe2 className="size-4" />}
          <span>{t("languageSwitcher.label", "Language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t("common.language", "Language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {localeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => void setLocale(option.value)}
            disabled={isSwitchingLocale}
            className="flex items-center justify-between"
          >
            <span>{t(option.labelKey, option.nativeLabel)}</span>
            {locale === option.value ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

