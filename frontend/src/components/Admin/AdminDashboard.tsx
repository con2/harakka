import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectSelectedUser,
} from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Eye,
  LoaderCircle,
  MoveRight,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import {
  getAllOrders,
  selectAllOrders,
  selectOrdersLoading,
  updatePaymentStatus,
} from "@/store/slices/ordersSlice";
import { Badge } from "../ui/badge";
import { BookingItem, BookingOrder, PaymentStatus } from "@/types";
import { fetchAllItems, selectAllItems } from "@/store/slices/itemsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import OrderDeleteButton from "./OrderDeleteButton";
import OrderReturnButton from "./OrderReturnButton";
import OrderRejectButton from "./OrderRejectButton";
import OrderConfirmButton from "./OrderConfirmButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const items = useAppSelector(selectAllItems);
  const user = useAppSelector(selectSelectedUser);
  const orders = useAppSelector(selectAllOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  useEffect(() => {
    if (!ordersLoading && user?.id && orders.length === 0) {
      dispatch(getAllOrders(user.id));
    }
  }, [dispatch, user?.id, orders.length, ordersLoading]);

   const handleViewDetails = (order: BookingOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status)
      return (
        <Badge variant="outline">{t.adminDashboard.status.unknown[lang]}</Badge>
      );

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            {t.adminDashboard.status.pending[lang]}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            {t.adminDashboard.status.confirmed[lang]}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.cancelled[lang]}
          </Badge>
        );
      case "cancelled by user":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.cancelled[lang]}
          </Badge>
        );
      case "cancelled by admin":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.cancelledByAdmin[lang]}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.rejected[lang]}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            {t.adminDashboard.status.completed[lang]}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Define columns for the DataTable
  // Orders table
   const columns: ColumnDef<BookingOrder>[] = [
    {
      accessorKey: "order_number",
      header: t.orderList.columns.orderNumber[lang],
    },
    {
      accessorKey: "user_profile.name",
      header: t.orderList.columns.customer[lang],
      cell: ({ row }) => (
        <div>
          <div>
            {row.original.user_profile?.name ||
              t.orderList.status.unknown[lang]}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.user_profile?.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.orderList.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: t.orderList.columns.orderDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "final_amount",
      header: t.orderList.columns.total[lang],
      cell: ({ row }) => `€${row.original.final_amount?.toFixed(2) || "0.00"}`,
    },
    {
      accessorKey: "invoice_status",
      header: t.orderList.columns.invoice[lang],
      cell: ({ row }) => {
        const paymentStatus = row.original.payment_status ?? "N/A";

        const handleStatusChange = (newStatus: "invoice-sent" | "paid" | "payment-rejected" | "overdue" | "N/A") => {
          dispatch(updatePaymentStatus({
            orderId: row.original.id,
            status: newStatus === "N/A" ? null : (newStatus as PaymentStatus),
          }));
        };

        return (
          <Select onValueChange={handleStatusChange} value={paymentStatus}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {["invoice-sent", "paid", "payment-rejected", "overdue", "N/A"].map((status) => {
                const statusKeyMap: Record<string, keyof typeof t.orderList.columns.invoice.invoiceStatus> = {
                  "invoice-sent": "sent",
                  "paid": "paid",
                  "payment-rejected": "rejected",
                  "overdue": "overdue",
                  "N/A": "NA",
                };
                const statusKey = statusKeyMap[status];
                return (
                  <SelectItem className="text-xs" key={status} value={status}>
                    {t.orderList.columns.invoice.invoiceStatus?.[statusKey]?.[lang] || status}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      header: t.orderList.columns.actions[lang],
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
              title={t.orderList.buttons.viewDetails[lang]}
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
      header: t.orderList.modal.orderItems.columns.item[lang],
      cell: (i) => {
        const itemName = i.getValue();
        return (
          String(itemName).charAt(0).toUpperCase() + String(itemName).slice(1)
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t.orderList.modal.orderItems.columns.quantity[lang],
    },
    {
      accessorKey: "start_date",
      header: t.orderList.modal.orderItems.columns.startDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.start_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "end_date",
      header: t.orderList.modal.orderItems.columns.endDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.end_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "subtotal",
      header: t.orderList.modal.orderItems.columns.subtotal[lang],
      cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
    },
  ];

  return (
    <div>
      <div className="w-full flex flex-wrap justify-evenly items-center mb-8 gap-4">
        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.users[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Users className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{users.length}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.items[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Warehouse className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{items.length}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.orders[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ShoppingBag className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{orders.length}</span>
          </div>
        </div>
      </div>
      {/* Recent Orders Section */}
      <div className="mb-8">
        <h2 className="text-left">
          {t.adminDashboard.sections.recentOrders[lang]}
        </h2>
        {ordersLoading ? (
          <div className="flex justify-center items-center py-6">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={[...orders]
              .sort(
                (a, b) =>
                  new Date(b.created_at || "").getTime() -
                  new Date(a.created_at || "").getTime(),
              )
              .slice(0, 8)}
          />
        )}
        <div className="flex items-center justify-center mt-4">
          <Button
            variant={"secondary"}
            className="flex items-center gap-2"
            onClick={() => navigate("/admin/orders")}
          >
            {t.adminDashboard.sections.manageOrders[lang]} <MoveRight className="inline-block"/>
          </Button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="min-w-[320px]">
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle className="text-left">
                  {t.orderList.columns.orderNumber[lang]}{" "}
                  {selectedOrder.order_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-normal">
                      {t.orderList.modal.customer[lang]}
                    </h3>
                    <p className="text-sm mb-0">
                      {selectedOrder.user_profile?.name ||
                        t.orderList.status.unknown[lang]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.user_profile?.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-normal">
                      {t.orderList.modal.orderInfo[lang]}
                    </h3>
                    <p className="text-sm mb-0">
                      {t.orderList.modal.status[lang]}{" "}
                      <StatusBadge status={selectedOrder.status} />
                    </p>
                    <p className="text-sm">
                      {t.orderList.modal.date[lang]}{" "}
                      {formatDate(
                        new Date(selectedOrder.created_at || ""),
                        "d MMM yyyy",
                      )}
                    </p>
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
                <div className="flex flex-col justify-center space-x-4">
                  <Separator />
                  <div className="flex flex-row items-center gap-4 mt-4 justify-center">
                  {selectedOrder.status === "pending" && (
                    <>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-slate-600">{t.orderList.modal.buttons.confirm[lang]}</span>
                      <OrderConfirmButton
                        id={selectedOrder.id}
                        closeModal={() => setShowDetailsModal(false)}
                      />
                      </div>
                      <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-slate-600">{t.orderList.modal.buttons.reject[lang]}</span>
                      <OrderRejectButton
                        id={selectedOrder.id}
                        closeModal={() => setShowDetailsModal(false)}
                      />
                      </div>
                    </>
                  )}

                  {selectedOrder.status === "confirmed" && (
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-slate-600">{t.orderList.modal.buttons.return[lang]}</span>
                    <OrderReturnButton
                      id={selectedOrder.id}
                      closeModal={() => setShowDetailsModal(false)}
                    />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-slate-600">{t.orderList.modal.buttons.delete[lang]}</span>
                  <OrderDeleteButton
                    id={selectedOrder.id}
                    closeModal={() => setShowDetailsModal(false)}
                  />
                  </div>
                </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        )}
      </div>
  );
}

export default AdminDashboard;
