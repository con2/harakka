import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  assignTagToItem,
  fetchTagsForItem,
  selectAllTags,
  selectSelectedTags,
} from "@/store/slices/tagSlice";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { TagAssignFormProps } from "@/types";
import { toast } from "sonner";

const TagAssignmentForm: React.FC<TagAssignFormProps> = ({ itemId }) => {
  const dispatch = useAppDispatch();
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Track selected tag ids

  // Get all tags and the selected tags for the specific item
  const tags = useAppSelector(selectAllTags); // Get all available tags
  const existingTags = useAppSelector(selectSelectedTags); // Tags assigned to this item

  useEffect(() => {
    dispatch(fetchTagsForItem(itemId)); // Fetch existing tags assigned to the item
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dispatch the action to assign selected tags to the item
      dispatch(assignTagToItem({ itemId, tagIds: selectedTags }));
      toast.success("Tags assigned successfully!");
    } catch (error) {
      toast.error("Failed to assign tags");
      console.error("Tag assignment error:", error);
    }
  };

  return (
    <div>
      <h2>Assign Tags to Item</h2>
      <form onSubmit={handleSubmit}>
        <div>
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedTags.includes(tag.id) ||
                  existingTags?.some(
                    (existingTag) => existingTag.id === tag.id,
                  ) ||
                  false
                } // Pre-check if tag is assigned
                onChange={() => handleCheckboxChange(tag.id)}
              />
              <label>
                {tag.translations?.fi?.name ||
                  tag.translations?.en?.name ||
                  "Unnamed"}
              </label>
            </div>
          ))}
        </div>

        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default TagAssignmentForm;
