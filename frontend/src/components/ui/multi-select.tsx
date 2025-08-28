import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

type MultiSelectProps = {
  selected: string[];
  options: string[];
  onChange: (selected: string[]) => void;
};

export const MultiSelect = ({
  selected,
  options,
  onChange,
}: MultiSelectProps) => {
  const [search, setSearch] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { lang } = useLanguage();

  const handleToggle = (value: string) => {
    const updatedSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(updatedSelected);
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={t.uiComponents.multiSelect.searchPlaceholder[lang]}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        onFocus={() => setIsDropdownOpen(true)}
        onBlur={() => setIsDropdownOpen(false)}
      />
      {isDropdownOpen && (
        <div
          className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          style={{ maxHeight: "200px" }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {t.uiComponents.multiSelect.noResults[lang]}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option}
                className={`flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white ${
                  selected.includes(option) ? "bg-primary text-white" : ""
                }`}
                onClick={() => handleToggle(option)}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="mr-2"
                />
                <span>{option}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
