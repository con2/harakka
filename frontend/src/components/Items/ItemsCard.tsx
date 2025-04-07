// Updated ItemsCard component
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Box as BoxIcon } from "lucide-react";

import defaultImage from '../../assets/defaultImage.jpg';

const DEFAULT_ITEM_IMAGE = defaultImage;

interface StorageItem {
  id: string;
  location: string;
  price: number;
  imageUrl?: string; // optional image URL
}

interface ItemsCardProps {
  item: StorageItem;
}

const ItemsCard = ({ item }: ItemsCardProps) => {
  const navigate = useNavigate();
  const handleItemClick = (itemPrice: number) => {
    navigate(`/items/${itemPrice}`);
  };

  return (
    <Card className="w-full max-w-[350px] m-1 flex flex-col justify-between p-4">
      {/* Image Section */}
      <div className="mb-4">
        <img
          src={item.imageUrl || DEFAULT_ITEM_IMAGE}
          alt="Item image"
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_ITEM_IMAGE;
          }}
        />
      </div>

      {/* Price and Location Section */}
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold text-center">
          €{item.price.toLocaleString()} {/* Formatted price */}
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <BoxIcon className="h-4 w-4" />
          <span>{item.location}</span>
        </div>
      </div>

      <Button onClick={() => handleItemClick(item.price)}>
        View Details
      </Button>
    </Card>
  );
};

export default ItemsCard;