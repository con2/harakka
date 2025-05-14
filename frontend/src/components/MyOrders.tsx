import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectUserOrders,
} from "@/store/slices/ordersSlice";
import { BookingOrder, BookingItem } from "@/types";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LoaderCircle } from "lucide-react";
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
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";

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
  const isMobile = useIsMobile();

  // Translation
  const { lang } = useLanguage();
  const { formatDate: formatDateLocalized } = useFormattedDate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user?.id) {
      toast.error(t.myOrders.error.loginRequired[lang]);
      navigate("/login");
      return;
    }

    dispatch(getUserOrders(user.id));
  }, [dispatch, navigate, user, lang]);

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
    return formatDateLocalized(new Date(dateString), "d MMM yyyy");
  };

  const handleViewDetails = (order: BookingOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Render a status badge with appropriate color
  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status)
      return <Badge variant="outline">{t.myOrders.status.unknown[lang]}</Badge>;

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            {t.myOrders.status.pending[lang]}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            {t.myOrders.status.confirmed[lang]}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.myOrders.status.cancelled[lang]}
          </Badge>
        );
      case "cancelled by user":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.myOrders.status.cancelledByUser[lang]}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            {t.myOrders.status.completed[lang]}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<BookingOrder>[] = [
    {
      accessorKey: "order_number",
      header: t.myOrders.columns.orderNumber[lang],
    },
    {
      accessorKey: "status",
      header: t.myOrders.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: t.myOrders.columns.date[lang],
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: "final_amount",
      header: t.myOrders.columns.total[lang],
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
              <OrderCancelButton
                id={order.id}
                closeModal={() => setShowDetailsModal(false)}
              />
            )}
          </div>
        );
      },
    },
  ];

  const bookingColumns: ColumnDef<BookingItem>[] = [
    {
      accessorKey: "item_name",
      header: t.myOrders.columns.item[lang],
      cell: ({ row }) =>
        (row.original.item_name || `Item ${row.original.item_id}`)
          .charAt(0)
          .toUpperCase() +
        (row.original.item_name || `Item ${row.original.item_id}`).slice(1),
    },
    {
      accessorKey: "quantity",
      header: t.myOrders.columns.quantity[lang],
    },
    {
      accessorKey: "start_date",
      header: t.myOrders.columns.startDate[lang],
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: t.myOrders.columns.endDate[lang],
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      accessorKey: "subtotal",
      header: t.myOrders.columns.subtotal[lang],
      cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.myOrders.loading[lang]}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <p>{t.myOrders.error.loadingError[lang]}</p>
        <p className="text-sm">{error}</p>
        <Button
          onClick={() => {
            if (!user?.id) {
              toast.error(t.myOrders.error.loginRequired[lang]);
              return;
            }
            dispatch(getUserOrders(user.id));
          }}
          className="mt-4"
        >
          {t.myOrders.buttons.tryAgain[lang]}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg">
      <div className="space-y-4">
        {/* Filtering UI */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={t.myOrders.filter.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            >
              <option value="all">{t.myOrders.filter.allStatuses[lang]}</option>
              <option value="pending">{t.myOrders.status.pending[lang]}</option>
              <option value="confirmed">
                {t.myOrders.status.confirmed[lang]}
              </option>
              <option value="cancelled">
                {t.myOrders.status.cancelled[lang]}
              </option>
              <option value="rejected">
                {t.myOrders.status.rejected[lang]}
              </option>
              <option value="completed">
                {t.myOrders.status.completed[lang]}
              </option>
              <option value="deleted">{t.myOrders.status.deleted[lang]}</option>
              <option value="cancelled by admin">
                {t.myOrders.status.cancelledByAdmin[lang]}
              </option>
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
                {t.myOrders.buttons.clearFilters[lang]}
              </Button>
            )}
          </div>
        </div>

        {/* Orders table or empty state */}
        {orders.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-lg mb-2">{t.myOrders.emptyState.title[lang]}</p>
            <p className="text-muted-foreground mb-4">
              {t.myOrders.emptyState.description[lang]}
            </p>
            <Button
              onClick={() => navigate("/storage")}
              className="bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
            >
              {t.myOrders.buttons.browseItems[lang]}
            </Button>
          </div>
        ) : isMobile ? (
          <Accordion type="multiple" className="w-full space-y-2">
            {filteredOrders.map((order) => (
              <AccordionItem key={order.id} value={String(order.id)}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-col w-full">
                    <span className="text-sm font-medium">
                      {t.myOrders.columns.orderNumber[lang]}{" "}
                      {order.order_number}
                    </span>
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
                        <strong>{t.myOrders.mobile.status[lang]}</strong>{" "}
                        <StatusBadge status={order.status} />
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="bg-slate-50 rounded-md">
                      <p className="text-md font-semibold">
                        {t.myOrders.orderDetails.items[lang]}:
                      </p>
                      <div className="space-y-2 p-1">
                        {order.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs space-y-1 border-b pb-2 last:border-b-0 last:pb-0"
                          >
                            <p>
                              <strong>{t.myOrders.mobile.item[lang]}</strong>{" "}
                              {(item.item_name || `Item ${item.item_id}`)
                                .charAt(0)
                                .toUpperCase() +
                                (
                                  item.item_name || `Item ${item.item_id}`
                                ).slice(1)}
                            </p>
                            <p>
                              <strong>
                                {t.myOrders.mobile.quantity[lang]}
                              </strong>{" "}
                              {item.quantity}
                            </p>
                            <p>
                              <strong>{t.myOrders.mobile.start[lang]}</strong>{" "}
                              {formatDate(item.start_date)}
                            </p>
                            <p>
                              <strong>{t.myOrders.mobile.end[lang]}</strong>{" "}
                              {formatDate(item.end_date)}
                            </p>
                            <p>
                              <strong>
                                {t.myOrders.mobile.subtotal[lang]}
                              </strong>{" "}
                              €{item.subtotal?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-3">
                      {order.status === "pending" && (
                        <OrderCancelButton
                          id={order.id}
                          closeModal={() => {}}
                        />
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="text-left">
                {t.myOrders.orderDetails.title[lang]}
                {selectedOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-normal text-sm mb-1">
                    {t.myOrders.orderDetails.customerInfo[lang]}
                  </h3>
                  <p className="text-xs text-grey-500">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div>
                  <h3 className="font-normal text-sm mb-1">
                    {t.myOrders.orderDetails.orderInfo[lang]}
                  </h3>
                  <p className="text-xs">
                    {t.myOrders.columns.status[lang]}:{" "}
                    <StatusBadge status={selectedOrder.status} />
                  </p>
                  <p className="text-xs">
                    {t.myOrders.columns.date[lang]}:{" "}
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-normal text-sm mb-2">
                  {t.myOrders.orderDetails.items[lang]}
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <DataTable
                    columns={bookingColumns}
                    data={selectedOrder.order_items || []}
                  />
                </div>

                <div className="flex items-center justify-end mt-4 pr-4">
                  <div className="text-sm font-medium">
                    {t.myOrders.orderDetails.total[lang]}
                  </div>
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
