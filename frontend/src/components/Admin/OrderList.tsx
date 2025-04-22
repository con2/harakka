import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrders,
  selectAllOrders,
  selectOrdersLoading,
  selectOrdersError
} from "@/store/slices/ordersSlice";
import { LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
//import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { OrderState } from "@/types/order";

const OrderList = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectAllOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const { authLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderState | null>(null);

  useEffect(() => {
    if (!authLoading  && orders.length === 0) {
      dispatch(fetchAllOrders());
    }
  }, [authLoading, orders.length, dispatch]);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-GB");

  const handleAddNew = () => {
    setSelectedOrder(null);
    setShowModal(true);
  };

  const handleEdit = (order: OrderState) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUserDetails = () => {
    return; //
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: "Order_items", header: "Item Name" },
    { accessorKey: "Quantity", header: "Quantity" },
    {
        accessorKey: "Status", // starting time for orders
        header: "Status" // need to edit
      },
    {
      accessorKey: "start_date", // starting time for orders
      header: "Order Start ", // need to edit
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
        accessorKey: "end_date", // end time for orders : should return the items before the end date
        header: "Order End ", // need to edit
        cell: ({ row }) => formatDate(row.original.created_at), // edit created_at
      },
      // add userdetails button...
      {
        id: "details",
        header: "User Details",
        cell: ({  }) => (
          <Button
            className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
            onClick={() => handleUserDetails}
          >
            Details
          </Button>
        ),
      },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => (
        <Button
          className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
          onClick={() => handleEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
    // {
    //   id: "Cancel",
    //   header: "Cancel",
    //   cell: ({ row }) => (
    //     <OrderCancelledButton id={row.original.id} closeModal={() => {}} />
    //   ),
    // },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

//   if (!isloggedIn) {
//     return <Navigate to="/unauthorized" replace />;
//   }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Manage Order</h1>

        <Button
          onClick={handleAddNew}
          className=" text-white rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2"
        >
          Add New Order
        </Button>
      </div>
        {/* {showModal && (
          <AddOrderModal
            onClose={() => setShowModal(false)}
            initialData={selectedOrder || undefined}
          />
        )} */}

        <PaginatedDataTable columns={columns} data={orders} />
    </>
  );
};

export default OrderList;