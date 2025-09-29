import { LoaderCircle } from "lucide-react";
import { ReactNode } from "react";

type SpinnerProps = {
  children?: ReactNode;
  height?: string;
  padding?: string;
  containerClasses?: string;
  loaderClasses?: string;
  text?: string;
};

function Spinner({
  children,
  height = "h-fit",
  padding = "p-2",
  containerClasses,
  loaderClasses,
  text,
}: SpinnerProps) {
  const CONTAINER_CLASSES = `flex justify-center items-center flex-col gap-1 ${height} ${padding} ${containerClasses}`;
  const LOADER_CLASSES = `animate-spin w-6 h-6 ${loaderClasses}`;

  return (
    <div className={CONTAINER_CLASSES}>
      <LoaderCircle className={LOADER_CLASSES} />
      {text && <span>{text}</span>}
      {children}
    </div>
  );
}

export default Spinner;
