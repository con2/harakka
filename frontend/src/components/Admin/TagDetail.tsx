import { useEffect, useState } from "react";
import { itemsApi } from "@/api/services/items";
import { Tag, Item } from "@/types";
import { LoaderCircle } from "lucide-react";

const TagDetail = ({ tag }: { tag: Tag }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const relatedItems = await itemsApi.getItemsByTag(tag.id);
        setItems(relatedItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [tag.id]);

  return (
    <div className="border rounded-md p-4 mt-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">
        Tag: {tag.translations.fi?.name ?? tag.translations.en?.name}
      </h2>

      {loading ? (
        <div className="flex justify-center p-4">
          <LoaderCircle className="animate-spin w-6 h-6" />
        </div>
      ) : (
        <div>
          <h3 className="font-medium mb-2">Assigned Items:</h3>
          {items.length === 0 ? (
            <p className="text-muted-foreground">
              No items assigned to this tag.
            </p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  {item.translations.fi?.item_name ??
                    item.translations.en?.item_name ??
                    "Unnamed Item"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TagDetail;
