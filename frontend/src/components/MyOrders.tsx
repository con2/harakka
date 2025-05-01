import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserOrders,
  selectOrdersLoading,
  selectOrdersError,
  cancelOrder,
  selectUserOrders,
} from "@/store/slices/ordersSlice";
import { BookingOrder, BookingItem } from "@/types";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { LoaderCircle, Eye, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { selectSelectedUser } from "@/store/slices/usersSlice";

const MyOrders = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectSelectedUser);
  const orders = useAppSelector(selectUserOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user?.id) {
      toast.error("Please log in to view your orders");
      navigate("/login");
      return;
    }

    dispatch(getUserOrders(user.id));
  }, [dispatch, navigate, user]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const handleViewDetails = (order: BookingOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Confirm Cancellation</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Are you sure you want to cancel this order?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast.dismiss(t)}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              toast.dismiss(t);
              try {
                await toast.promise(dispatch(cancelOrder(orderId)).unwrap(), {
                  loading: "Cancelling order...",
                  success: "Order cancelled successfully",
                  error: "Failed to cancel order",
                });

                if (showDetailsModal) setShowDetailsModal(false);
              } catch (error) {
                console.error("Error cancelling order:", error);
              }

              // After successful cancel refresh the list of orders
              if (user?.id) {
                dispatch(getUserOrders(user.id));
              }
            }}
          >
            Cancel Order
          </Button>
        </div>
      </div>
    ));
  };

  // Status badge component
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
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelOrder(order.id)}
                title="Cancel Order"
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>Loading your orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <p>Error loading your orders</p>
        <p className="text-sm">{error}</p>
        <Button
          onClick={() => {
            if (!user?.id) {
              toast.error("Please log in to view your orders");
              return;
            }
            dispatch(getUserOrders(user.id));
          }}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-lg mb-2">You don't have any orders yet</p>
          <p className="text-muted-foreground mb-4">
            Items you order will appear here
          </p>
          <Button
            onClick={() => (window.location.href = "/storage")}
            className="bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
          >
            Browse Storage Items
          </Button>
        </div>
      ) : (
        <PaginatedDataTable columns={columns} data={orders} />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.order_number}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Date</h3>
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Status</h3>
                  <StatusBadge status={selectedOrder.status} />
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

              {/* Action Buttons */}
              <DialogFooter>
                {selectedOrder.status === "pending" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                  >
                    Cancel Order
                  </Button>
                )}

                <Button
                  onClick={() => setShowDetailsModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyOrders;
