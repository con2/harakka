import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import hero from "@/assets/illusiaImage.jpg";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

function Error() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  return (
    <div>
      <div
        className="absolute inset-[-8px] bg-cover bg-center -z-10 filter brightness-[0.6] blur-[3px]"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      />
      <div className="justify-self-center relative top-[100px] max-w-[400px] w-fit p-6 bg-white rounded">
        <h1 className="text-3xl mb-[1rem] font-main font-semibold">
          {t.error.title[lang]}
        </h1>
        <div className="flex gap-2">
          <Button
            className="flex-1 rounded border border-1-(--subtle-grey) shadow-none"
            variant="default"
            onClick={() => navigate(-1)}
          >
            {t.error.buttons.back[lang]}
          </Button>
          <Button
            className="flex-1 rounded"
            variant="outline"
            onClick={() => navigate("/items")}
          >
            {t.error.buttons.home[lang]}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Error;
