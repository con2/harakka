import { Button } from "./button";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

function Pagination({
  pageIndex,
  pageCount,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
}) {
  const { lang } = useLanguage();

  return (
    <div className="flex items-center justify-center mt-5 space-x-2">
      <Button
        variant={"secondary"}
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
      >
        {t.pagination.previous[lang]}
      </Button>
      <span className="text-sm text-slate-500">
        {t.pagination.pageInfo[lang]
          .replace("{page}", String(pageIndex + 1))
          .replace("{total}", String(pageCount))}
      </span>
      <Button
        variant={"secondary"}
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex + 1 >= pageCount}
      >
        {t.pagination.next[lang]}
      </Button>
    </div>
  );
}

export default Pagination;
