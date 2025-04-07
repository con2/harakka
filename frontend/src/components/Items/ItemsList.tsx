import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
//import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
} from "../../store/slices/itemsSlice";
import ItemsCard from "./ItemsCard";

const ItemsList = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  //const [searchTerm, setSearchTerm] = useState("");
  //const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);

  //const DEFAULT_ITEM_IMAGE = '/default-item.jpg'; // default image


  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, items.length]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Storage Inventory</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <ItemsCard item={item} key={item.id}/>
        ))}
      </div>
    </div>
  );
};

export default ItemsList;