import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrderedUsersList,
  getUserCount,
  selectTotalUsersCount,
} from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import {
  Building2,
  LoaderCircle,
  MoveRight,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import {
  getBookingsCount,
  getOrderedBookings,
  selectAllBookings,
  selectTotalBookingsCount,
} from "@/store/slices/bookingsSlice";
import {
  fetchAllItems,
  getItemCount,
  selectAllItems,
  selectTotalItemsCount,
} from "@/store/slices/itemsSlice";
import {
  getOrganizationsCount,
  selectTotalOrganizationsCount,
} from "@/store/slices/organizationSlice";
import { useLanguage } from "@/context/LanguageContext";
import { useRoles } from "@/hooks/useRoles";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingPreview } from "@common/bookings/booking.types";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const bookings = useAppSelector(selectAllBookings);
  const bookingsLoading = useAppSelector((s) => s.bookings.loading);
  const navigate = useNavigate();
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const itemCount = useAppSelector(selectTotalItemsCount);
  const bookingsCount = useAppSelector(selectTotalBookingsCount);
  const userCount = useAppSelector(selectTotalUsersCount);
  const { activeContext } = useRoles();
  const organizationsCount = useAppSelector(selectTotalOrganizationsCount);
  const usersList = useAppSelector((s) => s.users.users.data || []);

  useEffect(() => {
    if (items.length <= 1) void dispatch(fetchAllItems({ page: 1, limit: 10 }));
  }, [dispatch, items.length]);

  useEffect(() => {
    void dispatch(getItemCount());
    void dispatch(getUserCount());
    void dispatch(getBookingsCount());
    if (activeContext?.roleName === "super_admin") {
      void dispatch(getOrganizationsCount());
    }
  }, [dispatch, activeContext?.organizationId, activeContext?.roleName]);

  useEffect(() => {
    if (activeContext?.roleName === "super_admin") {
      void dispatch(fetchAllOrderedUsersList({ page: 1, limit: 10 }));
    }
  }, [dispatch, activeContext?.roleName]);

  useEffect(() => {
    if (bookings.length <= 1) {
      void dispatch(
        getOrderedBookings({
          ordered_by: "created_at",
          ascending: true,
          page: 1,
          limit: 10,
        }),
      );
    }
  }, [dispatch, bookings.length]);

  // Define columns for the DataTable
  // Bookings table
  const columns: ColumnDef<BookingPreview>[] = [
    {
      accessorKey: "booking_number",
      header: t.bookingList.columns.bookingNumber[lang],
    },
    {
      accessorKey: "user_profile.name",
      header: t.bookingList.columns.customer[lang],
      cell: ({ row }) => (
        <div>
          <div>
            {row.original.full_name || t.bookingList.status.unknown[lang]}
          </div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.bookingList.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: t.bookingList.columns.bookingDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at || ""), "d MMM yyyy"),
    },
  ];

  return (
    <div>
      <div className="w-full flex flex-wrap justify-center items-center mb-8 gap-4">
        {activeContext?.roleName === "super_admin" && (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-fit max-w-[300px] flex-1">
            <div className="flex justify-center items-center">
              <p className="text-slate-500">Organizations</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Building2 className="h-10 w-10 text-(--iridiscent-blue-light) shrink-0" />
              <span className="text-4xl font-normal">{organizationsCount}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-fit max-w-[300px] flex-1">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.users[lang]}
            </p>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Users className="h-10 w-10 text-(--iridiscent-blue-light) shrink-0" />
            <span className="text-4xl font-normal">{userCount}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-fit max-w-[300px] flex-1">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.items[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Warehouse className="h-10 w-10 text-(--iridiscent-blue-light) shrink-0" />
            <span className="text-4xl font-normal">{itemCount}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-fit max-w-[300px] flex-1">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.bookings[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ShoppingBag className="h-10 w-10 text-(--iridiscent-blue-light) shrink-0" />
            <span className="text-4xl font-normal">{bookingsCount}</span>
          </div>
        </div>
      </div>
      {/* Recent section - users for super_admin, bookings for others */}
      <div className="mb-8">
        {activeContext?.roleName === "super_admin" ? (
          <>
            <h2 className="text-left">Recent Users</h2>
            <DataTable
              columns={
                [
                  { accessorKey: "full_name", header: "Name" },
                  { accessorKey: "email", header: "Email" },
                  { accessorKey: "created_at", header: "Joined" },
                ] as ColumnDef<Partial<Record<string, unknown>>>[]
              }
              data={usersList}
            />
            <div className="flex items-center justify-center mt-4">
              <Button
                variant={"secondary"}
                className="flex items-center gap-2"
                onClick={() => navigate("/admin/users")}
              >
                Manage Users <MoveRight className="inline-block" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-left">
              {t.adminDashboard.sections.recentBookings[lang]}
            </h2>
            {bookingsLoading ? (
              <div className="flex justify-center items-center py-6">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={[...bookings]
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
                onClick={() => navigate("/admin/bookings")}
              >
                {t.adminDashboard.sections.manageBookings[lang]}{" "}
                <MoveRight className="inline-block" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
