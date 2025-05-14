import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectUserOrders,
  updateOrder,
} from "@/store/slices/ordersSlice";
import { BookingOrder, BookingItem } from "@/types";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LoaderCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import OrderCancelButton from "./OrderCancelButton";
import OrderDetailsButton from "./Admin/OrderDetailsButton";
import { DataTable } from "./ui/data-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; 
import { useIsMobile } from "@/hooks/use-mobile";
import OrderEditButton from "./OrderEditButton";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import DatePickerButton from "./ui/DatePickerButton";
import { Calendar } from "./ui/calendar";

const MyOrders = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectSelectedUser);
  const orders = useAppSelector(selectUserOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState<BookingOrder | null>(null);
  const [editFormItems, setEditFormItems] = useState<BookingItem[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isMobile = useIsMobile();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user?.id) {
      toast.error("Please log in to view your orders");
      navigate("/login");
      return;
    }

    if (user?.id) {
      if (user?.id) {
        dispatch(getUserOrders(user.id));
      }
    }
  }, [dispatch, navigate, user]);

  // Apply filters to orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Filter by search query (order number)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderNumber = String(order.order_number || "").toLowerCase();

      return orderNumber.includes(query);
    }

    return true;
  });

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const handleViewDetails = (order: BookingOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleEditOrder = (order: BookingOrder) => {
    setItemQuantities(
      Object.fromEntries(order.order_items.map(item => [String(item.id), item.quantity]))
    );    
    setGlobalStartDate(order.order_items?.[0]?.start_date ?? null);
    setGlobalEndDate(order.order_items?.[0]?.end_date ?? null);
    setEditingOrder(order);
    setEditFormItems(order.order_items || []);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!editingOrder) return;

    const updatedItems = editFormItems.map(item => ({
      ...item,
      quantity: item.id !== undefined ? itemQuantities[item.id] ?? item.quantity : item.quantity,
      start_date: globalStartDate || item.start_date,
      end_date: globalEndDate || item.end_date,
    })).filter(item => item.quantity > 0);
  
    if (updatedItems.length === 0) {
      try {
        dispatch(updateOrder({
          orderId: editingOrder.id,
          items: updatedItems,
        }));
        toast.warning("All items removed — order cancelled.");
        if (user?.id) {
          dispatch(getUserOrders(user.id));
        }
      } catch {
        toast.error("Failed to cancel order.");
      } finally {
        setShowEditModal(false);
        setEditingOrder(null);
      }
      return;
    }
  
    try {
      await dispatch(updateOrder({
        orderId: editingOrder.id,
        items: updatedItems,
      })).unwrap();
  
      toast.success("Order updated!");
      setShowEditModal(false);
      setEditingOrder(null);
      if (user?.id) {
        dispatch(getUserOrders(user.id));
      }
    } catch (err) {
      toast.error("Failed to update order");
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Date",
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

        return (
          <div className="flex space-x-2">
            <OrderDetailsButton
              order={order}
              onViewDetails={handleViewDetails}
            />

            {isPending && (
              <>
                <OrderEditButton
                  order={order}
                  onEdit={handleEditOrder}
                />
                <OrderCancelButton
                  id={order.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  const bookingColumns: ColumnDef<BookingItem>[] = [
    {
      accessorKey: "item_name",
      header: "Item",
      cell: ({ row }) =>
        (row.original.item_name || `Item ${row.original.item_id}`)
          .charAt(0)
          .toUpperCase() +
        (row.original.item_name || `Item ${row.original.item_id}`).slice(1),
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg">
      {/* <h1 className="text-2xl font-bold mb-6 text-secondary ml-4">My Orders</h1> */}
      <div className="space-y-4">
        {/* Filtering UI */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search order #"
              value={searchQuery}
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

        {/* Orders table or empty state */}
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
        ) : isMobile ? (
          <Accordion type="multiple" className="w-full space-y-2">
            {filteredOrders.map((order) => (
              <AccordionItem key={order.id} value={String(order.id)}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-col w-full">
                    <span className="text-sm font-medium">Order #{order.order_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)} · {order.status}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1">
                    {/* Order Info */}
                    <div className="text-sm">
                      <p>
                        <strong>Status:</strong> <StatusBadge status={order.status} />
                      </p>
                      {/* <p>
                        <strong>Total:</strong> €{order.final_amount?.toFixed(2) || "0.00"}
                      </p> */}
                    </div>
        
                    {/* Order Items */}
                    <div className="bg-slate-50 rounded-md">
                      <p className="text-md font-semibold">Items:</p>
                      <div className="space-y-2 p-1">
                        {order.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs space-y-1 border-b pb-2 last:border-b-0 last:pb-0"
                          >
                            <p>
                              <strong>Item:</strong>{" "}
                              {(item.item_name || `Item ${item.item_id}`).charAt(0).toUpperCase() +
                                (item.item_name || `Item ${item.item_id}`).slice(1)}
                            </p>
                            <p>
                              <strong>Quantity:</strong> {item.quantity}
                            </p>
                            <p>
                              <strong>Start:</strong> {formatDate(item.start_date)}
                            </p>
                            <p>
                              <strong>End:</strong> {formatDate(item.end_date)}
                            </p>
                            <p>
                              <strong>Subtotal:</strong> €{item.subtotal?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
        
                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-3">
                      {order.status === "pending" && (
                        <>
                          <OrderEditButton
                            order={order}
                            onEdit={handleEditOrder}
                          />
                          <OrderCancelButton
                            id={order.id}
                            closeModal={() => {}}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <PaginatedDataTable columns={columns} data={filteredOrders} />
        )}        
      </div>

      {/* Editing Order Modal */}
      {editingOrder && (
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-sm overflow-visible">
          <DialogHeader className="items-start">
            <DialogTitle>Edit Order #{editingOrder.order_number}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-row gap-4">
              <div>
                <Label className="block text-sm font-medium mb-1">Start</Label>
                <Popover open={startPickerOpen} onOpenChange={setStartPickerOpen}>
                  <PopoverTrigger asChild>
                    <DatePickerButton
                      value={globalStartDate ? format(new Date(globalStartDate), "PPP") : null}
                      placeholder="Select start date"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    side="bottom"
                    align="start"
                    style={{ zIndex: 50, pointerEvents: "auto" }}
                  >
                  <Calendar
                    mode="single"
                    defaultMonth={globalStartDate ? new Date(globalStartDate) : undefined}
                    selected={
                      globalStartDate && !isNaN(Date.parse(globalStartDate))
                        ? new Date(globalStartDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      setGlobalStartDate(date?.toISOString() ?? null);
                      // setStartPickerOpen(false);
                    }}
                    disabled={(date) => date < today}
                  />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">End</Label>
                <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
                  <PopoverTrigger asChild>
                    <DatePickerButton
                      value={globalEndDate ? format(new Date(globalEndDate), "PPP") : null}
                      placeholder="Select end date"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    side="bottom"
                    align="start"
                    style={{ zIndex: 50, pointerEvents: "auto" }}
                  >
                    <Calendar
                      mode="single"
                      defaultMonth={globalStartDate ? new Date(globalStartDate) : undefined}
                      selected={
                        globalEndDate && !isNaN(Date.parse(globalEndDate))
                          ? new Date(globalEndDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        setGlobalEndDate(date?.toISOString() ?? null);
                        // setEndPickerOpen(false);
                      }}
                      disabled={(date) => {
                        const isBeforeToday = date < today;
                        const isBeforeStart =
                          globalStartDate && !isNaN(Date.parse(globalStartDate))
                            ? date < new Date(globalStartDate)
                            : false;
                        return isBeforeToday || isBeforeStart;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {editFormItems.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2">
                  <Label className="block text-xs font-medium">Item</Label>
                  <p className="text-sm">
                    {(item.item_name ? item.item_name.charAt(0).toUpperCase() + item.item_name.slice(1) : "Unnamed Item")}
                  </p>
                </div>
                <div style={{ zIndex: 50, pointerEvents: "auto" }}>
                  <Label className="block text-sm font-medium">Qty</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (item.id !== undefined) {
                          const newQty = (itemQuantities[item.id] || item.quantity) - 1;
                          // if (newQty === 0) {
                          //   toastConfirm({
                          //     title: "Remove Item?",
                          //     description: "Setting quantity to 0 will remove this item from your order.",
                          //     confirmText: "Remove",
                          //     cancelText: "Keep",
                          //     onConfirm: () => {
                          //       const updatedItems = [...editFormItems];
                          //       updatedItems.splice(idx, 1);
                          //       setEditFormItems(updatedItems);
                          //       // remove from itemQuantities too?
                          //       const updatedQuantities = { ...itemQuantities };
                          //       if (item.id !== undefined) {
                          //         delete updatedQuantities[item.id];
                          //       }
                          //       setItemQuantities(updatedQuantities);
                          //     },
                          //   });
                          // }
                          //  else {
                            setItemQuantities({ ...itemQuantities, [item.id]: newQty });
                          
                        }
                      }}
                    >
                      –
                    </Button>
                    <Input
                      value={item.id !== undefined ? itemQuantities[item.id] ?? item.quantity : item.quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val)) {
                          setItemQuantities({ ...itemQuantities, [String(item.id)]: val });
                        }
                      }}
                      className="w-[50px] text-center"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (item.id !== undefined) {
                          const newQty = (itemQuantities[item.id] || item.quantity) + 1;
                          setItemQuantities({ ...itemQuantities, [item.id]: newQty });
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

              </div>
            ))}

            <div className="flex justify-between gap-2 mt-4">
              <Button
                variant={"secondary"}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={"outline"}
                onClick={handleSubmitEdit}
                disabled={!editingOrder}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="text-left">
                Order Details #{selectedOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                <h3 className="font-normal text-sm mb-1">Customer Information</h3>
                  <p className="text-xs text-grey-500">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <h3 className="font-normal text-sm mb-1">Order Information</h3>
                  <p className="text-xs">
                    Status: <StatusBadge status={selectedOrder.status} />
                  </p>
                  <p className="text-xs">Date: {formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-normal text-sm mb-2">Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <DataTable columns={bookingColumns} data={selectedOrder.order_items || []} />
                </div>

                <div className="flex items-center justify-end mt-4 pr-4">
                  <div className="text-sm font-medium">Total:</div>
                  <div className="ml-2 font-bold">
                    €{selectedOrder.final_amount?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyOrders;
