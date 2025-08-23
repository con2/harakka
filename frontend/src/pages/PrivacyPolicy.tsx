import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

const PrivacyPolicy = () => {
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
              {t.privacyPolicy.title[lang]}
            </h1>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-700">
                  {t.privacyPolicy.effectiveDate[lang]}
                </span>{" "}
                {getCurrentDate()}
              </p>
              <p>
                <span className="font-medium text-gray-700">
                  {t.privacyPolicy.website[lang]}
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
                {t.privacyPolicy.content.introduction[lang]}
              </p>
            </div>

            {/* Information Collection Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.informationCollection.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.informationCollection.content[lang]}
              </p>
            </section>

            {/* Information Use Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.informationUse.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.informationUse.content[lang]}
              </p>
            </section>

            {/* Information Sharing Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.informationSharing.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.informationSharing.content[lang]}
              </p>
            </section>

            {/* Data Security Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.dataSecurity.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.dataSecurity.content[lang]}
              </p>
            </section>

            {/* Cookies Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.cookies.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.cookies.content[lang]}
              </p>
            </section>

            {/* User Rights Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.userRights.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.userRights.content[lang]}
              </p>
            </section>

            {/* Data Retention Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.dataRetention.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.dataRetention.content[lang]}
              </p>
            </section>

            {/* Changes Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.changes.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.changes.content[lang]}
              </p>
            </section>

            {/* Contact Section */}
            <section className="mb-8">
              <h2 className="text-l font-semibold mb-4 text-primary border-b border-gray-200 pb-2">
                {t.privacyPolicy.content.contact.title[lang]}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {t.privacyPolicy.content.contact.content[lang]}
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

export default PrivacyPolicy;
