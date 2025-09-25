import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const Footer = () => {
  // Translation
  const { lang } = useLanguage();

  return (
    <footer className="bg-secondary text-white py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-8 mt-4 text-left text-sm">
          <div className="flex flex-col flex-1">
            <h3>{t.footer.sections.shop.title[lang]}</h3>
            <ul className="text-left">
              <li>
                <a href="/storage">
                  {t.footer.sections.shop.links.products[lang]}
                </a>
              </li>
              <li>
                <a href="/cart">{t.footer.sections.shop.links.cart[lang]}</a>
              </li>
              <li>
                <a href="/contact-us">
                  {t.footer.sections.shop.links.contactUs[lang]}
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col flex-1">
            <h3>{t.footer.sections.about.title[lang]}</h3>
            <ul className="text-left">
              <li>
                <a href="/how-it-works">
                  {t.footer.sections.about.links.userGuides[lang]}
                </a>
              </li>
              <li>
                <a href="/privacy-policy">
                  {t.footer.sections.about.links.privacyPolicy[lang]}
                </a>
              </li>
              <li>
                <a href="/terms-of-use">
                  {t.footer.sections.about.links.termsOfUse[lang]}
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col flex-1">
            <h3>{t.footer.sections.stayUpdated.title[lang]}</h3>
            <div className="flex flex-col gap-2">
              <p>{t.footer.sections.stayUpdated.description[lang]}</p>
              {/* TODO: Add link */}
              <p className="underline">
                <a href="" target="_blank">
                  {t.footer.sections.stayUpdated.newsletter[lang]}
                </a>
              </p>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs">
          &copy; {new Date().getFullYear()} Harakka. {t.footer.copyright[lang]}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
