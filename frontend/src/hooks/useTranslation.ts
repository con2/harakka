import { useLanguage } from "@/context/LanguageContext";
import { Translatable } from "@/types";

export function useTranslation<T>() {
  const { lang } = useLanguage();

  // Get translated content from a Translatable object
  const getTranslation = (
    translatable: Translatable<T> | null,
    fallbackLanguage: "fi" | "en" = "fi",
  ): T | null => {
    if (!translatable?.translations) return null;

    // Try to get the translation in the current language
    const t = translatable.translations[lang];

    // If the translation is empty or null, try the fallback language
    if (!t || Object.values(t).every((v) => !v)) {
      return translatable.translations[fallbackLanguage];
    }

    return t;
  };

  return { getTranslation, lang };
}
