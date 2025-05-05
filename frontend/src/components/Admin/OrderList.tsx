import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectAllOrders,
} from "@/store/slices/ordersSlice";
import { LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useAuth } from "@/context/AuthContext";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { BookingOrder, BookingItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import OrderReturnButton from "./OrderReturnButton";
import OrderConfirmButton from "./OrderConfirmButton";
import OrderRejectButton from "./OrderRejectButton";
import OrderDeleteButton from "./OrderDeleteButton";
import OrderDetailsButton from "./OrderDetailsButton";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Always fetch orders when the admin component mounts and auth is ready
    if (!authLoading && user && user.id && !ordersLoadedRef.current) {
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

  // Apply filters to orders before passing to table
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    // Filter by search query (order number or customer name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderNumber = String(order.order_number || "").toLowerCase();
      const customerName = (order.user_profile?.name || "").toLowerCase();
      const customerEmail = (order.user_profile?.email || "").toLowerCase();

      return (
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query)
      );
    }

    return true;
  });

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
            <OrderDetailsButton
              order={order}
              onViewDetails={handleViewDetails}
            />

            {isPending && (
              <>
                <OrderConfirmButton
                  id={order.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
                <OrderRejectButton
                  id={order.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </>
            )}

            {isConfirmed && (
              <OrderReturnButton
                id={order.id}
                closeModal={() => setShowDetailsModal(false)}
              />
            )}

            <OrderDeleteButton
              id={order.id}
              closeModal={() => setShowDetailsModal(false)}
            />
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
          <h1 className="text-xl">Manage Orders</h1>

          <Button //TODO: remove later. Button for debugging purposes
            onClick={() => user && user?.id && dispatch(getAllOrders(user.id))}
            className="bg-background rounded-2xl text-primary/80 border-primary/80 border-1 hover:text-white hover:bg-primary/90"
          >
            Refresh Orders
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search order # or customer name"
              value={searchQuery}
              size={50}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="deleted">Deleted</option>
              <option value="cancelled by admin">Cancelled by admin</option>
            </select>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                size={"sm"}
                className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <PaginatedDataTable columns={columns} data={filteredOrders} />
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

              {/* Order Modal Actions */}
              <div className="flex justify-end space-x-2">
                {selectedOrder.status === "pending" && (
                  <>
                    <OrderConfirmButton
                      id={selectedOrder.id}
                      closeModal={() => setShowDetailsModal(false)}
                    />
                    <OrderRejectButton
                      id={selectedOrder.id}
                      closeModal={() => setShowDetailsModal(false)}
                    />
                  </>
                )}

                {selectedOrder.status === "confirmed" && (
                  <OrderReturnButton
                    id={selectedOrder.id}
                    closeModal={() => setShowDetailsModal(false)}
                  />
                )}

                <OrderDeleteButton
                  id={selectedOrder.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default OrderList;
