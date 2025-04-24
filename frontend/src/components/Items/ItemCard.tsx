import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Box as BoxIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { getItemById, deleteItem } from '@/store/slices/itemsSlice';
import { Item } from '../../types/item';

interface ItemsCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemsCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin'; // Admin check

  // Navigate to the item's detail page
  const handleItemClick = (itemId: string) => {
    dispatch(getItemById(itemId)); // Fetch the item by ID when clicked
    navigate(`/items/${itemId}`);
  };

  // Handle item deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await dispatch(deleteItem(item.id)).unwrap(); // Delete item via Redux action
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Handle item update (for admin only)
  const handleUpdate = () => {
    // Navigate to the update form or trigger a modal to edit the item
    navigate(`/admin/items/${item.id}/edit`);
  };

  return (
    <Card
      data-cy="items-card"
      className="w-full max-w-[350px] m-1 flex flex-col justify-between p-4"
    >
      {/* Image Section */}

      {/* Item Details */}
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold text-center">
          {item.translations.fi.item_name}
        </h2>
        <p className="text-lg text-center">
          {item.translations.fi.item_description}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <BoxIcon className="h-4 w-4" />
          <span>{item.location_id}</span>
        </div>
      </div>

      {/* View Details Button */}
      <Button onClick={() => handleItemClick(item.id)}>View Details</Button>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="mt-2 flex gap-2">
          <Button variant="outline" onClick={handleUpdate}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ItemCard;
