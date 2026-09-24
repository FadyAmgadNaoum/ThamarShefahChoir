import arEG from "@/locales/ar-EG.json";
import en from "@/locales/en.json";

export type Locale = "ar-EG" | "en";
export type Dictionaries = typeof arEG;

const dictionaries: Record<Locale, Dictionaries> = {
  "ar-EG": arEG,
  en: en as unknown as Dictionaries,
};

export const defaultLocale: Locale = "ar-EG";

export function getDictionary(locale: Locale = defaultLocale): Dictionaries {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function formatMessage(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

