import { defineRouting } from "next-intl/routing";
import { LOCALES } from "@/engine/types";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  localePrefix: "always",
});
