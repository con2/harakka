import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const Unauthorized = () => {
  // Translation
  const { lang } = useLanguage();

  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold text-red-600">
        {t.unauthorized.title[lang]}
      </h1>
      <p>{t.unauthorized.message[lang]}</p>
    </div>
  );
};

export default Unauthorized;
