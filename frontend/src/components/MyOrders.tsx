import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelOrder,
  getUserOrders,
  selectOrdersError,
  selectOrdersLoading,
  selectUserOrders,
  updateOrder,
} from "@/store/slices/ordersSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { BookingItem, BookingOrder } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

import { ordersApi } from "@/api/services/orders";
import OrderDetailsButton from '@/components/Admin/Orders/OrderDetailsButton';
import OrderCancelButton from '@/components/OrderCancelButton';
import OrderEditButton from '@/components/OrderEditButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { t } from "@/translations";
import DatePickerButton from "../components/ui/DatePickerButton";
import { Calendar } from "../components/ui/calendar";
import { DataTable } from "../components/ui/data-table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

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
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);
  const [availability, setAvailability] = useState<{ [itemId: string]: number }>({});
  const [loadingAvailability, setLoadingAvailability] = useState<{ [itemId: string]: boolean }>({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isMobile = useIsMobile();

  // Translation
  const { lang } = useLanguage();
  const { formatDate: formatDateLocalized } = useFormattedDate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      toast.error(t.myOrders.error.loginRequired[lang]);
      navigate("/login");
      return;
    }

    if (user && !orders)
      dispatch(getUserOrders(user.id));

  }, [dispatch, navigate, user, lang, orders]);

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

  const handleEditOrder = (order: BookingOrder) => {
    setItemQuantities(
      Object.fromEntries(
        order.order_items.map((item) => [String(item.id), item.quantity]),
      ),
    );
    setGlobalStartDate(order.order_items?.[0]?.start_date ?? null);
    setGlobalEndDate(order.order_items?.[0]?.end_date ?? null);
    setEditingOrder(order);
    setEditFormItems(order.order_items || []);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!editingOrder) return;

    const updatedItems = editFormItems
      .map((item) => ({
        ...item,
        quantity:
          item.id !== undefined
            ? (itemQuantities[item.id] ?? item.quantity)
            : item.quantity,
        start_date: globalStartDate || item.start_date,
        end_date: globalEndDate || item.end_date,
      }))
      .filter((item) => item.quantity > 0);

    if (updatedItems.length === 0) {
      try {
        dispatch(
          updateOrder({
            orderId: editingOrder.id,
            items: updatedItems,
          }),
        );
        dispatch(cancelOrder(editingOrder.id));
        toast.warning(t.myOrders.edit.toast.emptyCancelled[lang]);
        if (user?.id) {
          dispatch(getUserOrders(user.id));
        }
      } catch {
        toast.error(t.myOrders.edit.toast.cancelFailed[lang]);
      } finally {
        setShowEditModal(false);
        setEditingOrder(null);
      }
      return;
    }

    try {
      await dispatch(
        updateOrder({
          orderId: editingOrder.id,
          items: updatedItems,
        }),
      ).unwrap();

      toast.success(t.myOrders.edit.toast.orderUpdated[lang]);
      setShowEditModal(false);
      setEditingOrder(null);
      if (user?.id) {
        dispatch(getUserOrders(user.id));
      }
    } catch {
      toast.error(t.myOrders.edit.toast.updateFailed[lang]);
    }
  };
  // fetch availability for an item on a given date
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!globalStartDate || !globalEndDate) return;

      for (const item of editFormItems) {
        const itemId = item.item_id;
        const currentOrderQty = item.quantity ?? 0;

        setLoadingAvailability(prev => ({ ...prev, [itemId]: true }));

        try {
          const data = await ordersApi.checkAvailability(
            itemId,
            globalStartDate,
            globalEndDate
          );

          const correctedAvailableQuantity = data.availableQuantity + currentOrderQty;

          setAvailability(prev => ({
            ...prev,
            [itemId]: correctedAvailableQuantity,
          }));
        } catch (err) {
          console.error(`Error checking availability for item ${itemId}:`, err);
        } finally {
          setLoadingAvailability(prev => ({ ...prev, [itemId]: false }));
        }
      }
    };

    fetchAvailability();
  }, [globalStartDate, globalEndDate, editFormItems]);

  const isFormValid = editFormItems.every((item) => {
    const inputQty = item.id !== undefined ? (itemQuantities[item.id] ?? item.quantity) : item.quantity;
    const availQty = availability[item.item_id];

    return availQty === undefined || inputQty <= availQty;
  });


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
      case "cancelled by admin":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.myOrders.status.cancelledByAdmin[lang]}
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
      accessorKey: "date_range",
      header: t.orderList.columns.dateRange[lang],
      cell: ({ row }) => {
        const items = row.original.order_items || [];
        if (items.length === 0) return "-";

        // Get earliest start_date
        const minStartDate = items.reduce((minDate, item) => {
          const date = new Date(item.start_date);
          return date < minDate ? date : minDate;
        }, new Date(items[0].start_date));

        // Get latest end_date
        const maxEndDate = items.reduce((maxDate, item) => {
          const date = new Date(item.end_date);
          return date > maxDate ? date : maxDate;
        }, new Date(items[0].end_date));

        return (
          <div className="text-sm flex flex-col">
            <span>{`${formatDate(minStartDate.toISOString())} -`}</span>
            <span>{`${formatDate(maxEndDate.toISOString())}`}</span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "final_amount",
    //   header: t.myOrders.columns.total[lang],
    //   cell: ({ row }) => `€${row.original.final_amount?.toFixed(2) || "0.00"}`,
    // },
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
                <OrderEditButton order={order} onEdit={handleEditOrder} />
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
      header: t.myOrders.columns.item[lang],
      cell: ({ row }) => {
        const itemData = row.original;
        let itemName = null;

        // Try to get from translations in current language
        if (
          itemData.storage_items?.translations &&
          itemData.storage_items.translations[lang]?.item_name
        ) {
          itemName = itemData.storage_items.translations[lang].item_name;
        }
        // Fall back to alternate language
        else if (
          itemData.storage_items?.translations &&
          itemData.storage_items.translations[lang === "fi" ? "en" : "fi"]
            ?.item_name
        ) {
          itemName =
            itemData.storage_items.translations[lang === "fi" ? "en" : "fi"]
              .item_name;
        }
        // Fall back to stored item_name
        else {
          itemName = itemData.item_name || `Item ${itemData.item_id}`;
        }

        return itemName.charAt(0).toUpperCase() + itemName.slice(1);
      },
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
    // {
    //   accessorKey: "subtotal",
    //   header: t.myOrders.columns.subtotal[lang],
    //   cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
    // },
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
                      <p>
                        <strong>{t.myOrders.mobile.start[lang]}</strong>{" "}
                        {formatDate(order.order_items?.[0]?.start_date)}
                      </p>
                      <p>
                        <strong>{t.myOrders.mobile.end[lang]}</strong>{" "}
                        {formatDate(order.order_items?.[0]?.end_date)}
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
                              {(() => {
                                let itemName;

                                // Try to get translated name from storage_items
                                if (
                                  item.storage_items?.translations?.[lang]
                                    ?.item_name
                                ) {
                                  itemName =
                                    item.storage_items.translations[lang]
                                      .item_name;
                                }
                                // Fall back to alternate language
                                else if (
                                  item.storage_items?.translations?.[
                                    lang === "fi" ? "en" : "fi"
                                  ]?.item_name
                                ) {
                                  itemName =
                                    item.storage_items.translations[
                                      lang === "fi" ? "en" : "fi"
                                    ].item_name;
                                }
                                // Fall back to stored item_name
                                else {
                                  itemName =
                                    item.item_name || `Item ${item.item_id}`;
                                }

                                return (
                                  itemName.charAt(0).toUpperCase() +
                                  itemName.slice(1)
                                );
                              })()}
                            </p>
                            <p>
                              <strong>
                                {t.myOrders.mobile.quantity[lang]}
                              </strong>{" "}
                              {item.quantity}
                            </p>
                            {/* <p>
                              <strong>{t.myOrders.mobile.start[lang]}</strong>{" "}
                              {formatDate(item.start_date)}
                            </p>
                            <p>
                              <strong>{t.myOrders.mobile.end[lang]}</strong>{" "}
                              {formatDate(item.end_date)}
                            </p> */}
                            {/* <p>
                              <strong>
                                {t.myOrders.mobile.subtotal[lang]}
                              </strong>{" "}
                              €{item.subtotal?.toFixed(2) || "0.00"}
                            </p> */}
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
                            closeModal={() => { }}
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
              <DialogTitle>
                {t.myOrders.edit.title[lang]}
                {editingOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-1">
                    {t.myOrders.edit.startDate[lang]}
                  </Label>
                  <Popover
                    open={startPickerOpen}
                    onOpenChange={setStartPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <DatePickerButton
                        value={
                          globalStartDate
                            ? formatDateLocalized(
                              new Date(globalStartDate),
                              "d MMM yyyy",
                            )
                            : null
                        }
                        placeholder={t.myOrders.edit.selectStartDate[lang]}
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
                        defaultMonth={
                          globalStartDate
                            ? new Date(globalStartDate)
                            : undefined
                        }
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
                  <Label className="block text-sm font-medium mb-1">
                    {t.myOrders.edit.endDate[lang]}
                  </Label>
                  <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
                    <PopoverTrigger asChild>
                      <DatePickerButton
                        value={
                          globalEndDate
                            ? formatDateLocalized(
                              new Date(globalEndDate),
                              "d MMM yyyy",
                            )
                            : null
                        }
                        placeholder={t.myOrders.edit.selectEndDate[lang]}
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
                        defaultMonth={
                          globalStartDate
                            ? new Date(globalStartDate)
                            : undefined
                        }
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
                            globalStartDate &&
                              !isNaN(Date.parse(globalStartDate))
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
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-4"
                >
                  <div className="col-span-2 items-center">
                    <Label className="block text-xs font-medium">
                      {t.myOrders.edit.item[lang]}
                    </Label>
                    <p className="text-sm">
                      {(() => {
                        let itemName;

                        // Try to get translated name from storage_items
                        if (
                          item.storage_items?.translations?.[lang]?.item_name
                        ) {
                          itemName =
                            item.storage_items.translations[lang].item_name;
                        }
                        // Fall back to alternate language
                        else if (
                          item.storage_items?.translations?.[
                            lang === "fi" ? "en" : "fi"
                          ]?.item_name
                        ) {
                          itemName =
                            item.storage_items.translations[
                              lang === "fi" ? "en" : "fi"
                            ].item_name;
                        }
                        // Fall back to stored item_name
                        else {
                          itemName =
                            item.item_name || t.myOrders.edit.unnamedItem[lang];
                        }

                        return (
                          itemName.charAt(0).toUpperCase() + itemName.slice(1)
                        );
                      })()}
                    </p>
                  </div>
                  <div className="flex flex-col h-full" style={{ zIndex: 50, pointerEvents: "auto" }}>
                    {/* <Label className="block text-sm font-medium">
                      {t.myOrders.edit.quantity[lang]}
                    </Label> */}
                    <div className="flex items-center gap-1 mt-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={item.id !== undefined &&
                          itemQuantities[item.id] === 0}
                        onClick={() => {
                          if (item.id !== undefined) {
                            const newQty =
                              (itemQuantities[item.id] || item.quantity) - 1;
                            if (newQty >= 0) {
                              setItemQuantities({
                                ...itemQuantities,
                                [String(item.id)]: newQty,
                              });
                            }
                          }
                        }}
                      >
                        –
                      </Button>
                      <Input
                        value={
                          item.id !== undefined
                            ? (itemQuantities[item.id] ?? item.quantity)
                            : item.quantity
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            setItemQuantities({
                              ...itemQuantities,
                              [String(item.id)]: val,
                            });
                          }
                        }}
                        className="w-[50px] text-center"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={availability[item.item_id] !== undefined &&
                          item.id !== undefined &&
                          itemQuantities[item.id] === availability[item.item_id]}
                        onClick={() => {
                          if (item.id !== undefined) {
                            const newQty =
                              (itemQuantities[item.id] || item.quantity) + 1;
                            setItemQuantities({
                              ...itemQuantities,
                              [String(item.id)]: newQty,
                            });
                          }
                        }}
                      >
                        +
                      </Button>
                    </div>
                    {loadingAvailability[item.item_id] && (
                      <div className="flex items-center justify-center mt-2">
                        <LoaderCircle className="animate-spin h-4 w-4" />
                      </div>
                    )}
                    {!loadingAvailability[item.item_id] && (
                      <p className="text-xs italic text-slate-400 mt-1">Total of {availability[item.item_id]} items bookable</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between gap-2 mt-4">
                <Button
                  variant={"secondary"}
                  onClick={() => setShowEditModal(false)}
                >
                  {t.myOrders.edit.buttons.cancel[lang]}
                </Button>
                <Button
                  variant={"outline"}
                  onClick={handleSubmitEdit}
                  disabled={!editingOrder || !isFormValid}
                >
                  {t.myOrders.edit.buttons.saveChanges[lang]}
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

                {/* <div className="flex items-center justify-end mt-4 pr-4">
                  <div className="text-sm font-medium">
                    {t.myOrders.orderDetails.total[lang]}
                  </div>
                  <div className="ml-2 font-bold">
                    €{selectedOrder.final_amount?.toFixed(2) || "0.00"}
                  </div>
                </div> */}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyOrders;
