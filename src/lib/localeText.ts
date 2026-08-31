import { assertNever } from "@/engine/geometry";
import type { AppLocale } from "@/engine/types";
import type { LocalizedName } from "@/content/signs/types";

export function localeText(value: LocalizedName, locale: AppLocale): string {
  switch (locale) {
    case "en":
      return value.en;
    case "pl":
      return value.pl;
    case "ru":
      return value.ru;
    default:
      return assertNever(locale);
  }
}

export function L(en: string, pl: string, ru: string): LocalizedName {
  return { en, pl, ru };
}
