import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

const TermsOfUse = () => {
  const { lang } = useLanguage();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString(lang === "fi" ? "fi-FI" : "en-US");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header */}
          <header className="px-6 py-8 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold text-secondary mb-4">
              {t.termsOfUse.title[lang]}
            </h1>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-700">
                  {t.termsOfUse.effectiveDate[lang]}
                </span>{" "}
                {getCurrentDate()}
              </p>
              <p>
                <span className="font-medium text-gray-700">
                  {t.termsOfUse.website[lang]}
                </span>{" "}
                {window.location.origin}
              </p>
            </div>
          </header>

          {/* Content */}
          <main className="px-6 py-8">
            {/* Introduction */}
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-secondary rounded-r-md">
              <p className="text-gray-700 leading-relaxed">
                {t.termsOfUse.content.introduction[lang]}
              </p>
            </div>

            {/* Service Description Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.serviceDescription.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.serviceDescription.content[lang]}
              </p>
            </section>

            {/* User Conduct Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.userConduct.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.userConduct.content[lang]}
              </p>
            </section>

            {/* Intellectual Property Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.intellectualProperty.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.intellectualProperty.content[lang]}
              </p>
            </section>

            {/* Limitation of Liability Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.limitationOfLiability.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.limitationOfLiability.content[lang]}
              </p>
            </section>

            {/* Termination Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.termination.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.termination.content[lang]}
              </p>
            </section>

            {/* Governing Law Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.governingLaw.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.governingLaw.content[lang]}
              </p>
            </section>

            {/* Changes Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.termsOfUse.content.changes.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.termsOfUse.content.changes.content[lang]}
              </p>
            </section>
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

export default TermsOfUse;
