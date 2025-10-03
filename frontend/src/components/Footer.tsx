import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { Link } from "react-router-dom";

const Footer = () => {
  // Translation
  const { lang } = useLanguage();

  return (
    <footer className="bg-secondary text-white py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-8 mt-4 text-left text-sm group group-hover:[&_a]:underline">
          <div className="flex flex-col flex-1">
            <h3>{t.footer.sections.shop.title[lang]}</h3>
            <ul className="text-left">
              <li>
                <Link
                  to="/storage"
                  className="hover:underline underline-offset-2"
                >
                  {t.footer.sections.shop.links.products[lang]}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:underline underline-offset-2">
                  {t.footer.sections.shop.links.cart[lang]}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="hover:underline underline-offset-2"
                >
                  {t.footer.sections.shop.links.contactUs[lang]}
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col flex-1">
            <h3>{t.footer.sections.about.title[lang]}</h3>
            <ul className="text-left">
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:underline underline-offset-2"
                >
                  {t.footer.sections.about.links.userGuides[lang]}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:underline underline-offset-2"
                >
                  {t.footer.sections.about.links.privacyPolicy[lang]}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-use"
                  className="hover:underline underline-offset-2"
                >
                  {t.footer.sections.about.links.termsOfUse[lang]}
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col flex-1">
            <h3>THE TEAM</h3>
            <div className="flex flex-col gap-2">
              <Link to="" className="hover:underline underline-offset-2">
                Dev team
              </Link>
              <p>
                Big thank you to photographer{" "}
                <Link
                  to="https://www.flickr.com/people/darkismus/"
                  target="_blank"
                  className="underline"
                >
                  Tuomas Puikkonen
                </Link>{" "}
                for allowing use of his images
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
