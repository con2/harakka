import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSelectedTags,
  selectAllTags,
  fetchFilteredTags,
  updateTag,
  selectTag,
  clearSelectedTags,
} from "@/store/slices/tagSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UpdateTagDto } from "@/types/tag";
import type { ExtendedTag } from "@common/items/tag.types";
import TagDelete from "@/components/Admin/Items/TagDelete";

const TagDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const selected = useAppSelector(selectSelectedTags);
  const allTags = useAppSelector(selectAllTags);

  const [tag, setTag] = useState<ExtendedTag | null>(
    selected && selected.length > 0 ? selected[0] : null,
  );
  const [fiName, setFiName] = useState("");
  const [enName, setEnName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [originalFi, setOriginalFi] = useState("");
  const [originalEn, setOriginalEn] = useState("");

  useEffect(() => {
    if (!tag && id) {
      const found = allTags?.find((t) => t.id === id) as ExtendedTag | undefined;
      if (found) {
        void dispatch(selectTag(found));
        setTag(found);
      } else {
        void dispatch(fetchFilteredTags({ page: 1, limit: 100 }));
      }
    }
  }, [id, allTags, tag, dispatch]);

  useEffect(() => {
    if (tag) {
      const fi = tag.translations?.fi?.name ?? "";
      const en = tag.translations?.en?.name ?? "";
      setFiName(fi);
      setEnName(en);
      setOriginalFi(fi);
      setOriginalEn(en);
    }
  }, [tag]);

  const handleBack = () => {
    void dispatch(clearSelectedTags());
    void navigate("/admin/tags");
  };

  const handleSave = async () => {
    if (!tag) return;
    const payload: UpdateTagDto = {
      translations: {
        fi: { name: fiName },
        en: { name: enName },
      },
    };

    setSubmitting(true);
    try {
      await dispatch(updateTag({ id: tag.id, tagData: payload })).unwrap();
      toast.success(t.tagDetailsPage.messages.success[lang]);
      void dispatch(fetchFilteredTags({ page: 1, limit: 10 }));
      void navigate("/admin/tags");
    } catch {
      toast.error(t.tagDetailsPage.messages.error[lang]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleted = () => {
    void dispatch(fetchFilteredTags({ page: 1, limit: 10 }));
    void navigate("/admin/tags");
  };

  if (!tag) {
    return (
      <div>
        <h1 className="text-xl mb-4">{t.tagDetailsPage.title[lang]}</h1>
        <p className="text-muted-foreground">
          {t.tagDetailsPage.loading[lang]}
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={handleBack}>
            {t.addCategory?.buttons?.back?.[lang] ?? "Back"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl">{t.tagDetailsPage.title[lang]}</h1>
        <TagDelete id={tag.id} onDeleted={handleDeleted} />
      </div>

      <div className="mt-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              {t.tagDetailsPage.labels.fiName[lang]}
            </label>
            <Input value={fiName} onChange={(e) => setFiName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              {t.tagDetailsPage.labels.enName[lang]}
            </label>
            <Input value={enName} onChange={(e) => setEnName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack}>
                {t.tagDetailsPage?.buttons?.back?.[lang] ?? "Back"}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={
                submitting || (fiName === originalFi && enName === originalEn)
              }
            >
              {submitting
                ? "Saving..."
                : (t.tagDetailsPage.buttons.save?.[lang] ?? "Save changes")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagDetailsPage;
