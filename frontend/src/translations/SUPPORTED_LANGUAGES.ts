import { supportedLanguages } from "@/translations/modules/supportedLanguages";

export const SUPPORTED_LANGUAGES = [
  {
    lang: "English",
    key: "en",
    translations: supportedLanguages.en,
  },
  {
    lang: "Finnish",
    key: "fi",
    translations: supportedLanguages.fi,
  },
];

// Array of just the language keys (country codes)
export const SUPPORTED_LANGUAGES_KEYS = SUPPORTED_LANGUAGES.map((l) => l.key);
