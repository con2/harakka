// Added this to avoid refactoring 50+ files
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from "react";
import { supportedLanguages } from "@/translations/modules/supportedLanguages";
// Define available languages
export type Language = "fi" | "en";
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

// Language context type
type LanguageContextType = {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (fi: string, en: string) => string; // Simple translation helper
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  lang: "fi", // Default to Finnish
  setLanguage: () => {},
  t: (fi) => fi,
});

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType =>
  useContext(LanguageContext);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Try to get stored language preference, default to browser language or Finnish
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split("-")[0];
    return browserLang === "fi" ? "fi" : "en";
  };

  const storedLanguage = localStorage.getItem("language") as Language;
  const [lang, setLanguageState] = useState<Language>(
    storedLanguage || getBrowserLanguage(),
  );

  // Update language and store in localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  // Simple translation helper function
  const t = (fi: string, en: string): string => {
    return lang === "fi" ? fi : en;
  };

  // Make the context available
  const value = {
    lang,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
