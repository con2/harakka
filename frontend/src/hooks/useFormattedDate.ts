import { format } from "date-fns";
import { fi, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";

export const useFormattedDate = () => {
  const { lang } = useLanguage();

  // Get the correct locale based on the current language
  const getLocale = () => (lang === "fi" ? fi : enUS);

  // Format the date with the appropriate locale
  const formatDate = (
    date: Date | number | string | undefined,
    formatString: string,
  ) => {
    if (!date) return "";

    // Convert string to Date if needed
    const dateObj = typeof date === "string" ? new Date(date) : date;

    return format(dateObj, formatString, { locale: getLocale() });
  };

  return { formatDate };
};
