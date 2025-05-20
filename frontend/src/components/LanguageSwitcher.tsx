import { useLanguage } from "@/context/LanguageContext";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

// Define the Language type if not already imported
type Language = "fi" | "en";

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLanguage } = useLanguage();

  return (
    <ToggleGroup
      type="single"
      value={lang}
      size={"sm"}
      onValueChange={(value) => {
        if (value) setLanguage(value as Language);
      }}
      className="inline-flex"
      aria-label="Language switcher"
    >
      <ToggleGroupItem
        value="fi"
        aria-label="Finnish"
        size={"sm"}
        className="px-2 py-1.5 text-xs font-medium transition-colors data-[state=on]:bg-secondary data-[state=on]:text-white data-[state=off]:text-muted-foreground"
      >
        FI
      </ToggleGroupItem>
      <ToggleGroupItem
        value="en"
        aria-label="English"
        size={"sm"}
        className="px-2 py-1.5 text-xs font-medium transition-colors data-[state=on]:bg-secondary data-[state=on]:text-white data-[state=off]:text-muted-foreground"
      >
        EN
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
