import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "./ui/switch";

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-secondary/20 shadow-sm">
      <span
        className={`text-xs font-medium transition-colors ${lang === "fi" ? "text-secondary font-bold" : "text-muted-foreground"}`}
      >
        FI
      </span>
      <Switch
        checked={lang === "en"}
        onCheckedChange={() => setLanguage(lang === "fi" ? "en" : "fi")}
        className="data-[state=checked]:bg-secondary data-[state=unchecked]:bg-secondary/30"
      />
      <span
        className={`text-xs font-medium transition-colors ${lang === "en" ? "text-secondary font-bold" : "text-muted-foreground"}`}
      >
        EN
      </span>
    </div>
  );
};
