// Updated ItemsCard component
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Box as BoxIcon } from "lucide-react";
import defaultImage from "../../assets/defaultImage.jpg";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { itemsApi } from "@/api/services/items";
import { fetchAllItems } from "@/store/slices/itemsSlice";
import { Item } from "@/types/item";

const DEFAULT_ITEM_IMAGE = defaultImage;

/* interface StorageItem {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string; // optional image URL
} */

interface ItemsCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemsCardProps) => {
  const navigate = useNavigate();

  const handleItemClick = (itemName: string) => {
    // change that to show a default image!!!
    navigate(`/items/${item.id}`);
  };
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin"; // maybe doesnt show? - take it from user_profile instead!
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await itemsApi.deleteItem(item.id);
      dispatch(fetchAllItems()); // ERROR fixed here!
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = () => {
    console.log("Edit item", item.id);
    // example open Modal or navigate to /admin/items/:id/edit
  };
  console.log(item);

  return (
    <Card className="w-full max-w-[350px] m-1 flex flex-col justify-between p-4">
      {/* Image Section */}
      <div className="mb-4">
        {/*  <img
          src={item.img || DEFAULT_ITEM_IMAGE}
          alt="Item image"
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_ITEM_IMAGE;
          }}
        /> */}
      </div>

      {/* Price and Location Section */}
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold text-center">
          {item.translations.fi.item_name}{" "}
          {/* parameterize it take it from context */}
        </h2>
        <p className="text-xl font-semibold text-center">
          {item.translations.fi.item_description}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <BoxIcon className="h-4 w-4" />
          <span>{item.location_id}</span>
        </div>
      </div>

      <Button onClick={() => handleItemClick(item.id)}>View Details</Button>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="mt-2 flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Create Item
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ItemCard;
