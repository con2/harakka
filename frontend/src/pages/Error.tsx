import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import hero from "@/assets/illusiaImage.jpg";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

type ErrorProps = {
  type?: "not-found" | "server-error";
};

function Error({ type = "server-error" }: ErrorProps) {
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
      <div className="justify-self-center relative top-[150px] max-w-[400px] w-fit p-11 bg-white rounded">
        <img
          className="absolute left-0 top-[-24%] w-[70px]"
          src="https://rcbddkhvysexkvgqpcud.supabase.co/storage/v1/object/public/public-files/angy.png"
        />
        <h1 className="text-[5rem] text-center font-main font-semibold leading-[1]">
          {type === "not-found" ? "404" : "500"}
        </h1>
        <h2 className="text-3xl mb-[1rem] font-main text-primary font-semibold">
          {t.error.titles[type][lang]}
        </h2>
        <p className="mb-[2rem] text-center text-base font-main">
          {t.error.descriptions[type][lang]}
        </p>
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
