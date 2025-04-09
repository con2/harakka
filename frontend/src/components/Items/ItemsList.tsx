import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllItems,
  selectAllItems,
  selectItemsLoading,
  selectItemsError,
} from "../../store/slices/itemsSlice";
import ItemCard from "./ItemCard";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import ItemsLoader from "../../context/ItemsLoader";
import { useAuth } from "../../context/AuthContext";

const ItemsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  // Auth state from AuthContext
  const { user, authLoading } = useAuth();

  // Check if the user is an admin
  const isAdmin = user?.user_metadata?.role === "admin";

  // Fetch all items when the component mounts
  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <ItemsLoader /> {/* Displaying loader component */}
      </div>
    );
  }

  // Error handling
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      {/* Show the create button only for admins */}
      {isAdmin && (
        <Button
          className="mb-4"
          onClick={() => navigate("/admin/items/create")}
        >
          Create New Item
        </Button>
      )}

      {/* Render the list of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <p>No items found</p> // Message when no items exist
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default ItemsList;
