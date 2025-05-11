import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectAllOrders,
} from "@/store/slices/ordersSlice";
import { Eye, LoaderCircle } from "lucide-react";
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
import { DataTable } from "../ui/data-table";

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
      cell: ({ row }) => {
        const order = row.original;
        const isPending = order.status === "pending";
        const isConfirmed = order.status === "confirmed";

        return (
          <div className="flex space-x-1">
            <Button
              variant={"ghost"}
              size="sm"
              onClick={() => handleViewDetails(order)}
              title="View Details"
              className="hover:text-slate-900 hover:bg-slate-300"
            >
              <Eye className="h-4 w-4" />
            </Button>

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

  const orderColumns: ColumnDef<BookingItem>[] = [
    {
      accessorKey: "item_name",
      header: "Item",
      cell: (i) => {
        const itemName = i.getValue();
        return String(itemName).charAt(0).toUpperCase() + String(itemName).slice(1);
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
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
        <div className="min-w-[320px]">
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-left">
                Order #{selectedOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-normal">Customer</h3>
                  <p className="text-sm  mb-0">{selectedOrder.user_profile?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.user_profile?.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-normal">Order Information</h3>
                  <p className="text-sm mb-0">
                    Status: <StatusBadge status={selectedOrder.status} />
                  </p>
                  <p className="text-sm">Date: {formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <DataTable
                  columns={orderColumns}
                  data={selectedOrder.order_items || []}
                />
              </div>

              {/* Order Modal Actions */}
              <div className="flex justify-center space-x-4">
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
        </div>
      )}
    </>
  );
};

export default OrderList;
