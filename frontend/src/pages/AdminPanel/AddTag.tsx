import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { createTag } from "@/store/slices/tagSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { toast } from "sonner";

const AddTag = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [fiName, setFiName] = React.useState("");
  const [enName, setEnName] = React.useState("");

  const resetForm = () => {
    setFiName("");
    setEnName("");
  };

  const handleCancel = () => {
    resetForm();
    void navigate("/admin/tags");
  };

  const handleSubmit = async () => {
    if (!fiName && !enName) {
      toast.error(
        t.addTagModal?.messages?.validationError?.[lang] ?? "Provide a name",
      );
      return;
    }

    const payload = {
      translations: {
        fi: { name: fiName ?? "" },
        en: { name: enName ?? "" },
      },
    };

    try {
      await dispatch(createTag(payload)).unwrap();
      toast.success(t.addTagModal?.messages?.success?.[lang] ?? "Tag created");
      void navigate("/admin/tags");
    } catch {
      toast.error(
        t.addTagModal?.messages?.error?.[lang] ?? "Failed to create tag",
      );
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl mb-4">
        {t.addTagModal?.title?.[lang] ?? "Add Tag"}
      </h1>

      <div className="space-y-4">
        <div>
          <Label>
            {t.addTagModal?.labels?.fiName?.[lang] ?? "Finnish name"}
          </Label>
          <Input
            value={fiName}
            onChange={(e) => setFiName(e.target.value)}
            placeholder={t.addTagModal?.placeholders?.fiName?.[lang]}
          />
        </div>

        <div>
          <Label>
            {t.addTagModal?.labels?.enName?.[lang] ?? "English name"}
          </Label>
          <Input
            value={enName}
            onChange={(e) => setEnName(e.target.value)}
            placeholder={t.addTagModal?.placeholders?.enName?.[lang]}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={handleCancel}>
            {t.addTagModal?.buttons?.cancel?.[lang] ?? "Back"}
          </Button>
          <Button variant="outline" onClick={handleSubmit}>
            {t.addTagModal?.buttons?.creating?.[lang] ??
              t.addTagModal?.buttons?.create?.[lang] ??
              "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTag;
