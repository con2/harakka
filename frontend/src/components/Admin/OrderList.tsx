import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllOrders,
  selectOrdersLoading,
  selectOrdersError,
  confirmOrder,
  rejectOrder,
  deleteOrder,
  returnItems,
  selectAllOrders,
} from "@/store/slices/ordersSlice";
import {
  LoaderCircle,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useAuth } from "@/context/AuthContext";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { BookingOrder, BookingItem } from "@/types/orders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { selectSelectedUser } from "@/store/slices/usersSlice";

const OrderList = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectAllOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const ordersLoadedRef = useRef(false);
  const user = useAppSelector(selectSelectedUser);
  const { authLoading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Only fetch orders once when the component mounts and auth is ready
    if (
      !authLoading &&
      user &&
      user.id &&
      (!orders || orders.length === 0) &&
      !ordersLoadedRef.current
    ) {
      dispatch(getAllOrders(user.id));
      ordersLoadedRef.current = true;
    }
  }, [authLoading, dispatch, user]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewDetails = (order: BookingOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleConfirmOrder = async (orderId?: string) => {
    if (!orderId) return;

    try {
      await toast.promise(dispatch(confirmOrder(orderId)).unwrap(), {
        loading: "Confirming order...",
        success: "Order confirmed successfully",
        error: "Failed to confirm order",
      });
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const handleRejectOrder = async (orderId?: string) => {
    if (!orderId) return;

    try {
      await toast.promise(dispatch(rejectOrder(orderId)).unwrap(), {
        loading: "Rejecting order...",
        success: "Order rejected",
        error: "Failed to reject order",
      });
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const handleDeleteOrder = async (orderId?: string) => {
    if (!orderId) return;

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Order Deletion</div>
        <div className="text-sm text-muted-foreground">
          Are you sure you want to delete this order? This action cannot be
          undone.
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-md"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-md"
            onClick={async () => {
              toast.dismiss(t); // dismiss confirmation toast
              try {
                await toast.promise(dispatch(deleteOrder(orderId)).unwrap(), {
                  loading: "Deleting order...",
                  success: "Order deleted successfully",
                  error: (err) => {
                    if (err.includes("403") || err.includes("Forbidden")) {
                      return "Permission denied: Only admins can delete orders";
                    }
                    return "Failed to delete order";
                  },
                });
                // Refresh orders list after successful deletion
                if (user && user.id) {
                  dispatch(getAllOrders(user.id));
                }
              } catch (error) {
                console.error("Error deleting order:", error);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ));
  };

  const handleReturnItems = async (orderId?: string) => {
    if (!orderId) return;

    try {
      await toast.promise(dispatch(returnItems(orderId)).unwrap(), {
        loading: "Processing return...",
        success: "Items returned successfully",
        error: "Failed to process return",
      });
    } catch (error) {
      console.error("Error processing return:", error);
    }
  };

  // Render a status badge with appropriate color
  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Confirmed
          </Badge>
        );
      case "cancelled":
      case "cancelled by user":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Cancelled
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<BookingOrder>[] = [
    {
      accessorKey: "order_number",
      header: "Order #",
    },
    {
      accessorKey: "user_profile.name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div>{row.original.user_profile?.name || "Unknown"}</div>
          <div className="text-xs text-gray-500">
            {row.original.user_profile?.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: "final_amount",
      header: "Total",
      cell: ({ row }) => `€${row.original.final_amount?.toFixed(2) || "0.00"}`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original;
        const isPending = order.status === "pending";
        const isConfirmed = order.status === "confirmed";

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(order)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isPending && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConfirmOrder(order.id)}
                  title="Confirm Order"
                  className="text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRejectOrder(order.id)}
                  title="Reject Order"
                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}

            {isConfirmed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReturnItems(order.id)}
                title="Process Return"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteOrder(order.id)}
              title="Delete Order"
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Order Management</h1>

          <Button
            onClick={() => user && user?.id && dispatch(getAllOrders(user.id))}
            variant="outline"
            className="ml-auto mr-2"
          >
            Refresh Orders
          </Button>
        </div>

        <PaginatedDataTable columns={columns} data={orders} />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Order Details #{selectedOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Customer</h3>
                  <p>{selectedOrder.user_profile?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.user_profile?.email}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <p>
                    Status: <StatusBadge status={selectedOrder.status} />
                  </p>
                  <p>Date: {formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.order_items?.map(
                        (item: BookingItem, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              {item.item_name || `Item ${item.item_id}`}
                            </td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">
                              {formatDate(item.start_date)}
                            </td>
                            <td className="px-4 py-2">
                              {formatDate(item.end_date)}
                            </td>
                            <td className="px-4 py-2">
                              €{item.subtotal?.toFixed(2) || "0.00"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right font-medium"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-2 font-bold">
                          €{selectedOrder.final_amount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex justify-end space-x-2">
                {selectedOrder.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleConfirmOrder(selectedOrder.id);
                        setShowDetailsModal(false);
                      }}
                      variant="default"
                    >
                      Confirm Order
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectOrder(selectedOrder.id);
                        setShowDetailsModal(false);
                      }}
                      variant="destructive"
                    >
                      Reject Order
                    </Button>
                  </>
                )}

                {selectedOrder.status === "confirmed" && (
                  <Button
                    onClick={() => {
                      handleReturnItems(selectedOrder.id);
                      setShowDetailsModal(false);
                    }}
                    variant="default"
                  >
                    Process Return
                  </Button>
                )}

                <Button
                  onClick={() => setShowDetailsModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default OrderList;
