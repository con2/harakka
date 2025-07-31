import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  assignTagToItem,
  fetchTagsForItem,
  selectAllTags,
  selectSelectedTags,
  selectTagsLoading,
} from "@/store/slices/tagSlice";
import { TagAssignFormProps } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const TagAssignmentForm: React.FC<TagAssignFormProps> = ({ itemId }) => {
  const dispatch = useAppDispatch();
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Track selected tag ids
  const loading = useAppSelector(selectTagsLoading);

  // Get all tags and the selected tags for the specific item
  const tags = useAppSelector(selectAllTags); // Get all available tags
  const existingTags = useAppSelector(selectSelectedTags); // Tags assigned to this item
  // Translation
  const { lang } = useLanguage();

  useEffect(() => {
    void dispatch(fetchTagsForItem(itemId)); // Fetch existing tags assigned to the item
  }, [itemId, dispatch]);

  // Update the useEffect to initialize selectedTags from existingTags
  useEffect(() => {
    if (existingTags) {
      setSelectedTags(existingTags.map((tag) => tag.id));
    }
  }, [existingTags]);

  // Handle checkbox changes
  const handleCheckboxChange = (tagId: string) => {
    setSelectedTags((prevSelected) => {
      if (prevSelected.includes(tagId)) {
        return prevSelected.filter((id) => id !== tagId); // Remove tag if it's already selected
      } else {
        return [...prevSelected, tagId]; // Add tag to selected
      }
    });
  };

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dispatch the action to assign selected tags to the item
      await dispatch(
        assignTagToItem({ itemId, tagIds: selectedTags }),
      ).unwrap();
      toast.success(t.tagAssignForm.messages.success[lang]);
    } catch (error) {
      toast.error(t.tagAssignForm.messages.error[lang]);
      console.error("Tag assignment error:", error);
    }
  };

  return (
    <div>
      <h2>{t.tagAssignForm.title[lang]}</h2>
      <form onSubmit={handleSubmit}>
        {tags.length > 0 ? (
          <div className="space-y-2 my-4">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleCheckboxChange(tag.id)}
                />
                <label>
                  {tag.translations?.fi?.name ||
                    tag.translations?.en?.name ||
                    "Unnamed"}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 my-4">{t.tagAssignForm.noTags[lang]}</p>
        )}

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.tagAssignForm.buttons.saving[lang]}
            </>
          ) : (
            t.tagAssignForm.buttons.save[lang]
          )}
        </Button>
      </form>
    </div>
  );
};

export default TagAssignmentForm;
