import { LoaderCircle } from "lucide-react";

type SpinnerProps = {
  height?: string;
  padding?: string;
  containerClasses?: string;
  loaderClasses?: string;
};

function Spinner({
  height = "h-fit",
  padding = "p-2",
  containerClasses,
  loaderClasses,
}: SpinnerProps) {
  const CONTAINER_CLASSES = `flex justify-center items-center ${height} ${padding} ${containerClasses}`;
  const LOADER_CLASSES = `animate-spin w-6 h-6 ${loaderClasses}`;

  return (
    <div className={CONTAINER_CLASSES}>
      <LoaderCircle className={LOADER_CLASSES} />
    </div>
  );
}

export default Spinner;
