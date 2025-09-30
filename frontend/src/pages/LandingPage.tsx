import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const LandingPage = () => {
  // Translation
  const { lang } = useLanguage();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-[-8px] bg-cover -z-10 filter brightness-[0.6] bg-top-left"
        style={{
          backgroundImage: `url(${hero})`,
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
