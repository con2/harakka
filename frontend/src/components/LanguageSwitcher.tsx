import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={lang === "fi" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("fi")}
        className="text-xs px-2 py-1 h-8"
      >
        Suomi
      </Button>
      <Button
        variant={lang === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-xs px-2 py-1 h-8"
      >
        English
      </Button>
    </div>
  );
};
