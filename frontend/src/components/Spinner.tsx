import { LoaderCircle } from "lucide-react";
import { ReactNode } from "react";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

type SpinnerProps = {
  children?: ReactNode;
  height?: string;
  padding?: string;
  containerClasses?: string;
  loaderClasses?: string;
};

function Spinner({
  children,
  height = "h-fit",
  padding = "p-2",
  containerClasses,
  loaderClasses,
}: SpinnerProps) {
  const { lang } = useLanguage();
  const CONTAINER_CLASSES = `flex justify-center items-center flex-col gap-1 ${height} ${padding} ${containerClasses}`;
  const LOADER_CLASSES = `animate-spin w-6 h-6 ${loaderClasses}`;

  return (
    <div className={CONTAINER_CLASSES} aria-label={t.common.loading[lang]}>
      <LoaderCircle aria-hidden className={LOADER_CLASSES} />
      {children}
    </div>
  );
}

export default Spinner;
