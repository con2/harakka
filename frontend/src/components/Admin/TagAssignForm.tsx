import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { assignTagToItem, fetchTagsForItem } from "@/store/slices/tagSlice";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

/**
 * Props for TagAssignmentForm component
 */
interface TagAssignFormProps {
  itemId: string;
}

const TagAssignmentForm: React.FC<TagAssignFormProps> = ({ itemId }) => {
  const dispatch = useAppDispatch();
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Track selected tag ids

  // Get all tags and the selected tags for the specific item
  const tags = useAppSelector((state: any) => state.tags.tags); // Get all available tags
  const existingTags = useAppSelector((state: any) => state.tags.selectedTags); // Tags assigned to this item

  useEffect(() => {
    dispatch(fetchTagsForItem(itemId)); // Fetch existing tags assigned to the item
  }, [itemId, dispatch]);

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

  // Handle form submission (assign tags to the item)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dispatch the action to assign selected tags to the item
    dispatch(assignTagToItem({ itemId, tagIds: selectedTags }));
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
                  selectedTags.includes(tag.id) || existingTags.includes(tag.id)
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
