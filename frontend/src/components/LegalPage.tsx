import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

interface LegalPageProps {
  type: "termsOfUse" | "privacyPolicy";
}

interface TranslationSection {
  fi: string;
  en: string;
}

interface LegalSection {
  title?: TranslationSection;
  content?: TranslationSection;
  fi?: string;
  en?: string;
}

export const LegalPage = ({ type }: LegalPageProps) => {
  const { lang } = useLanguage();
  const content = t[type];

  const getCurrentDate = () => {
    return new Date().toLocaleDateString(lang === "fi" ? "fi-FI" : "en-US");
  };

  const renderSection = (section: LegalSection, key: string) => {
    if (section.title && section.content) {
      return (
        <section key={key} className="mb-8">
          <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
            {section.title[lang]}
          </h2>
          <p className="text-gray-700 leading-relaxed text-base">
            {section.content[lang]}
          </p>
        </section>
      );
    }

    if (section[lang]) {
      return (
        <p key={key} className="text-gray-700 leading-relaxed mb-6 text-base">
          {section[lang]}
        </p>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header */}
          <header className="px-6 py-8 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold text-secondary mb-4">
              {content.title[lang]}
            </h1>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-700">
                  {content.effectiveDate[lang]}
                </span>{" "}
                {getCurrentDate()}
              </p>
              <p>
                <span className="font-medium text-gray-700">
                  {content.website[lang]}
                </span>{" "}
                {window.location.origin}
              </p>
            </div>
          </header>

          {/* Content */}
          <main className="px-6 py-8">
            {/* Introduction */}
            {content.content.introduction && (
              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-secondary rounded-r-md">
                <p className="text-gray-700 leading-relaxed">
                  {content.content.introduction[lang]}
                </p>
              </div>
            )}

            {/* All sections */}
            <div className="space-y-8">
              {Object.entries(content.content)
                .filter(([key]) => key !== "introduction")
                .map(([key, section]) => renderSection(section, key))}
            </div>
          </main>

          {/* Footer */}
          <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-sm text-gray-500 text-center">
              {lang === "fi" ? "Päivitetty viimeksi: " : "Last updated: "}
              {getCurrentDate()}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
