import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import hero from "@/assets/illusiaImage.jpg";
import hero1 from "@/assets/23045509900_f5dfa32a54_k.jpg";
import hero2 from "@/assets/26966104314_87b1105fcc_k.jpg";
import hero3 from "@/assets/29561469952_622d8912ba_k.jpg";

const LandingPage = () => {
  // Translation
  const { lang } = useLanguage();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-[-8px] bg-cover bg-center -z-10 filter brightness-[0.6] blur-[3px]"
        style={{
          backgroundImage: `url(${hero3})`,
        }}
      />

      {/* Content on top of image */}
      <div className="flex flex-col justify-center items-center min-h-screen text-white text-center px-4 gap-2">
        <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.7)]">
          {t.landingPage.heading[lang]}
        </h2>
        <p className="mb-6 text-xl text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">
          {t.landingPage.subheading[lang]}
        </p>
        <Button
          onClick={() => (window.location.href = "/storage")}
          className="bg-secondary text-white border:secondary font-semibold px-6 py-5 rounded-lg shadow hover:bg-white hover:text-secondary hover:border-secondary transition"
        >
          {t.landingPage.button[lang]}
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
