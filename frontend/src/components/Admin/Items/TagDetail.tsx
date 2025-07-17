import { useEffect, useState } from "react";
import { itemsApi } from "@/api/services/items";
import { Tag, Item } from "@/types";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const TagDetail = ({ tag }: { tag: Tag }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  // Translation
  const { lang } = useLanguage();

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
        {t.tagDetail.title[lang]}{" "}
        {tag.translations?.fi?.name ?? tag.translations?.en?.name}
      </h2>

      {loading ? (
        <div className="flex justify-center p-4">
          <LoaderCircle className="animate-spin w-6 h-6" />
          <span className="ml-2">{t.tagDetail.loading[lang]}</span>
        </div>
      ) : (
        <div>
          <h3 className="font-medium mb-2">
            {t.tagDetail.assignedItems.header[lang]}
          </h3>
          {items.length === 0 ? (
            <p className="text-muted-foreground">
              {t.tagDetail.assignedItems.empty[lang]}
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
