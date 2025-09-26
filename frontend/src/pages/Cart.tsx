import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useTranslation } from "@/hooks/useTranslation";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useRoles } from "@/hooks/useRoles";
import {
  selectSelectedUser,
  getCurrentUser,
  getUserAddresses,
} from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { ItemTranslation } from "@/types";
import {
  Calendar,
  ChevronLeft,
  LoaderCircle,
  MapPin,
  Trash2,
  AlertTriangle,
  Edit2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toastConfirm } from "../components/ui/toastConfirm";
import { TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ProfileCompletionModal } from "../components/Profile/ProfileCompletionModal";
import InlineTimeframePicker from "../components/InlineTimeframeSelector";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  updateQuantity,
} from "../store/slices/cartSlice";
import {
  createBooking,
  selectBookingLoading,
} from "../store/slices/bookingsSlice";
import { setTimeframe } from "../store/slices/timeframeSlice";
import { itemsApi } from "@/api/services/items";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  const bookingLoading = useAppSelector(selectBookingLoading);
  const userProfile = useAppSelector(selectSelectedUser);
  const user = useAppSelector(selectSelectedUser);
  const { getTranslation } = useTranslation<ItemTranslation>();
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  // Profile completion hook
  const { status: profileStatus, updateProfile } = useProfileCompletion();

  // Roles hook for checking user permissions
  const { activeContext } = useRoles();

  const [availabilityMap, setAvailabilityMap] = useState<{
    [itemId: string]: {
      availableQuantity: number;
      isChecking: boolean;
      error: string | null;
    };
  }>({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Date editing states
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  // Get start and end dates from the timeframe Redux slice
  const { startDate: startDateStr, endDate: endDateStr } = useAppSelector(
    (state) => state.timeframe,
  );

  // Convert string dates to Date objects when needed - useMemo to prevent constant re-rendering
  const startDate = useMemo(
    () => (startDateStr ? new Date(startDateStr) : null),
    [startDateStr],
  );

  const endDate = useMemo(
    () => (endDateStr ? new Date(endDateStr) : null),
    [endDateStr],
  );

  // Group items by location to detect different pickup locations
  const itemsByLocation = useMemo(() => {
    const locationMap = new Map<
      string,
      {
        locationInfo: {
          id: string;
          name: string;
          address: string;
        };
        items: typeof cartItems;
      }
    >();

    cartItems.forEach((cartItem) => {
      const locationId = cartItem.item.location_id;
      const locationName =
        cartItem.item.location_details?.name ||
        cartItem.item.location_name ||
        "Unknown Location";
      const locationAddress = cartItem.item.location_details?.address || "";

      if (!locationMap.has(locationId)) {
        locationMap.set(locationId, {
          locationInfo: {
            id: locationId,
            name: locationName,
            address: locationAddress,
          },
          items: [],
        });
      }

      locationMap.get(locationId)!.items.push(cartItem);
    });

    return Array.from(locationMap.values());
  }, [cartItems]);

  // Check if items are in different locations
  const hasMultipleLocations = itemsByLocation.length > 1;

  // Check if checkout should be disabled based on active role context
  const isCheckoutDisabled = useMemo(() => {
    if (
      !activeContext ||
      !activeContext.roleName ||
      !activeContext.organizationName
    ) {
      return false;
    }
    if (activeContext.roleName === "super_admin") {
      return true;
    }
    if (
      activeContext.roleName === "user" &&
      activeContext.organizationName !== "Global"
    ) {
      return true;
    }
    return false;
  }, [activeContext]);

  useEffect(() => {
    if (!startDate || !endDate || cartItems.length === 0) return;

    cartItems.forEach((cartItem) => {
      const itemId = cartItem.item.id;

      // Set loading state for this item
      setAvailabilityMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isChecking: true,
          error: null,
        },
      }));

      itemsApi
        .checkAvailability(itemId, startDate, endDate)
        .then((response) => {
          setAvailabilityMap((prev) => ({
            ...prev,
            [itemId]: {
              availableQuantity: response.availableQuantity,
              isChecking: false,
              error: null,
            },
          }));
        })
        .catch((error) => {
          console.error("availability error for item", itemId, error);

          setAvailabilityMap((prev) => ({
            ...prev,
            [itemId]: {
              availableQuantity: 0,
              isChecking: false,
              error: "error in availability check",
            },
          }));
        });
    });
  }, [cartItems, startDate, endDate]);

  // Load user addresses for profile completion check
  useEffect(() => {
    if (user?.id) {
      dispatch(getUserAddresses(user.id)).catch((error) => {
        console.warn("Failed to load user addresses:", error);
      });
    }
  }, [dispatch, user?.id]);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;

    // validate if quantity exceeds available quantity
    const availability = availabilityMap[id];
    if (availability && quantity > availability.availableQuantity) {
      // If user is trying to increase quantity beyond availability, show warning and don't allow
      if (quantity > (availability.availableQuantity || 0)) {
        toast.warning(
          `${t.cart.toast.itemsExceedQuantity[lang]} ${availability.availableQuantity}.`,
        );
        return;
      }
    }

    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    toastConfirm({
      title: t.cart.toast.removeItemTitle[lang],
      description: t.cart.toast.removeItemDescription[lang],
      confirmText: t.cart.toast.confirmRemove[lang],
      cancelText: t.cart.toast.cancelRemove[lang],
      onConfirm: () => {
        dispatch(removeFromCart(id));
        toast.success(t.cart.toast.itemRemoved[lang]);
      },
      onCancel: () => {
        toast.success(t.cart.toast.itemNotRemoved[lang]);
      },
    });
  };

  const handleClearCart = () => {
    toastConfirm({
      title: t.cart.toast.clearCartTitle[lang],
      description: t.cart.toast.clearCartDescription[lang],
      confirmText: t.cart.toast.confirmClear[lang],
      cancelText: t.cart.toast.cancelClear[lang],
      onConfirm: () => {
        dispatch(clearCart());
        toast.success(t.cart.toast.cartCleared[lang]);
      },
      onCancel: () => {
        toast.success(t.cart.toast.cartNotCleared[lang]);
      },
    });
  };

  const handleEditDates = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsEditingDates(true);
  };

  const handleCancelDateEdit = () => {
    setIsEditingDates(false);
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const handleSaveDates = async () => {
    if (!tempStartDate || !tempEndDate) {
      toast.error(t.cart.toast.selectDatesAndItems[lang]);
      return;
    }
    // check availability for all items with new dates
    const unavailableItems: string[] = [];
    // Set loading state for all items
    cartItems.forEach((cartItem) => {
      const itemId = cartItem.item.id;
      setAvailabilityMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isChecking: true,
          error: null,
        },
      }));
    });

    try {
      // Check availability for all items concurrently
      const availabilityChecks = cartItems.map(async (cartItem) => {
        try {
          const response = await itemsApi.checkAvailability(
            cartItem.item.id,
            tempStartDate,
            tempEndDate,
          );

          const itemContent = getTranslation(cartItem.item, lang) as
            | ItemTranslation
            | undefined;
          const itemName = itemContent?.item_name || "Unknown Item";

          // Update availability map
          setAvailabilityMap((prev) => ({
            ...prev,
            [cartItem.item.id]: {
              availableQuantity: response.availableQuantity,
              isChecking: false,
              error: null,
            },
          }));

          // Check if current quantity exceeds availability
          if (cartItem.quantity > response.availableQuantity) {
            unavailableItems.push(itemName);
          }

          return {
            itemId: cartItem.item.id,
            availableQuantity: response.availableQuantity,
            currentQuantity: cartItem.quantity,
            itemName,
          };
        } catch {
          setAvailabilityMap((prev) => ({
            ...prev,
            [cartItem.item.id]: {
              availableQuantity: 0,
              isChecking: false,
              error: "error in availability check",
            },
          }));

          const itemContent = getTranslation(cartItem.item, lang) as
            | ItemTranslation
            | undefined;
          const itemName = itemContent?.item_name || "Unknown Item";
          unavailableItems.push(itemName);

          return {
            itemId: cartItem.item.id,
            availableQuantity: 0,
            currentQuantity: cartItem.quantity,
            itemName,
          };
        }
      });

      await Promise.all(availabilityChecks);

      // Update the Redux store with new dates
      dispatch(
        setTimeframe({
          startDate: tempStartDate.toISOString(),
          endDate: tempEndDate.toISOString(),
        }),
      );
      toast.success(t.cart.toast.datesUpdated[lang]);

      // if some items are unavailable, show warning
      if (unavailableItems.length > 0) {
        toast.warning(t.cart.toast.someItemsUnavailable[lang]);
      }

      setIsEditingDates(false);
      setTempStartDate(null);
      setTempEndDate(null);
    } catch (error) {
      console.error("Error checking availability for new dates:", error);
      toast.error("Failed to check availability for new dates");
    }
  };

  const handleDateChange = (type: "start" | "end", date: Date | null) => {
    if (type === "start") {
      setTempStartDate(date);
    } else {
      setTempEndDate(date);
    }
  };

  const handleCheckoutClick = () => {
    if (isCheckoutDisabled) {
      toast.error(t.cart.buttons.wrongRole[lang]);
      return;
    }

    void handleCheckout();
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error(t.cart.toast.loginRequired[lang]);
      void navigate("/login");
      return;
    }

    if (!userProfile || !userProfile.id) {
      toast.error(t.cart.toast.profileLoading[lang]);
      return;
    }

    // Try to read stored user ID from localStorage
    const storedUserId = localStorage.getItem("userId");

    if (storedUserId !== userProfile.id) {
      // Synchronize the localStorage ID with profile ID
      localStorage.setItem("userId", userProfile.id);
    }

    if (!startDate || !endDate || cartItems.length === 0) {
      toast.error(t.cart.toast.selectDatesAndItems[lang]);
      return;
    }

    // Check if profile is complete before proceeding
    if (profileStatus && !profileStatus.isComplete) {
      setIsProfileModalOpen(true);
      return;
    }

    // Validate all items are within available quantity
    const invalidItems = cartItems.filter((item) => {
      const availability = availabilityMap[item.item.id];
      return availability && item.quantity > availability.availableQuantity;
    });

    if (invalidItems.length > 0) {
      toast.error(t.cart.toast.someItemsUnavailable[lang]);
      return;
    }

    // Format booking data according to backend expectations
    const bookingData: {
      user_id: string;
      items: {
        start_date: string;
        end_date: string;
        item_id: string;
        quantity: number;
        location_id: string;
        provider_organization_id: string;
      }[];
    } = {
      user_id: userProfile.id,
      items: cartItems.map((item) => ({
        item_id: item.item.id,
        quantity: item.quantity,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location_id: item.item.location_id,
        provider_organization_id: item.item.org_id ?? item.item.organization_id,
      })),
    };

    try {
      // Show loading toast
      const loadingToast = toast.loading(t.cart.toast.creatingBooking[lang]);

      // Attempt to create booking
      await dispatch(createBooking(bookingData)).unwrap();

      // If successful, show success toast and proceed
      toast.success(t.cart.toast.bookingCreated[lang], { id: loadingToast });

      // Clear cart after successful booking
      dispatch(clearCart());

      // Navigate to bookings page or confirmation
      void navigate("/bookings/confirmation");
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      console.error("Booking data that failed:", bookingData);

      // Dismiss any existing toasts first
      toast.dismiss();

      // Check if it's a profile incomplete error - could be structured error object or string
      let isProfileIncompleteError = false;

      if (typeof error === "object" && error !== null) {
        const errorObj = error as { errorCode?: string; message?: string };
        if (errorObj.errorCode === "PROFILE_INCOMPLETE") {
          isProfileIncompleteError = true;
        }
      }

      if (!isProfileIncompleteError) {
        const errorMessage =
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : t.cart.buttons.unknownError[lang];

        toast.error(`Checkout error: ${errorMessage}`);
        return;
      }

      if (isProfileIncompleteError) {
        // Show the profile completion modal instead of toast error
        setIsProfileModalOpen(true);
        return;
      }

      toast.error(
        `Checkout error: ${
          error instanceof Error
            ? error.message
            : t.cart.buttons.unknownError[lang]
        }`,
      );
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl">{t.cart.empty.title[lang]}</h2>
        <p>{t.cart.empty.description[lang]}</p>
        <div className="mt-4">
          <Button
            onClick={() => navigate("/storage")}
            className="bg-secondary text-white border:secondary font-semibold px-6 py-5 rounded-lg shadow hover:bg-white hover:text-secondary hover:border-secondary transition"
          >
            {t.cart.empty.browseButton[lang]}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total number of rental days
  const rentalDays =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;

  return (
    <div
      className="w-full max-w-6xl p-4 mt-0 md:mt-10 mx-auto sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white"
      data-cy="cart-root"
    >
      <div className="mb-3 mt-4 md:mt-0">
        <Button
          onClick={() => navigate("/storage")}
          className="text-secondary mb-4 ml-2 px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          data-cy="cart-back-btn"
        >
          <ChevronLeft /> {t.itemDetails.buttons.back[lang]}
        </Button>
        <p
          className="text-xl mb-4 text-left pl-2 text-secondary"
          data-cy="cart-title"
        >
          {t.cart.review.title[lang]}
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-10 mb-2">
        <div className="flex flex-col flex-2/3">
          {/* Booking Timeframe Summary */}
          <div
            className="bg-slate-50 p-4 rounded-lg mb-6"
            data-cy="cart-timeframe-summary"
          >
            {startDate && endDate ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary shrink-0" />
                    <span className="text-md min-w-[max-content]">
                      {t.cart.booking.timeframe[lang]}
                    </span>
                  </div>
                  {!isEditingDates && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditDates}
                      className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 p-1 h-auto"
                      data-cy="cart-edit-dates-btn"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      {t.cart.booking.editDates[lang]}
                    </Button>
                  )}
                </div>

                {isEditingDates ? (
                  <div className="space-y-4">
                    <InlineTimeframePicker
                      startDate={tempStartDate}
                      endDate={tempEndDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      maxRangeDays={42}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelDateEdit}
                        data-cy="cart-cancel-date-edit-btn"
                      >
                        {t.cart.booking.cancelEdit[lang]}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleSaveDates}
                        disabled={!tempStartDate || !tempEndDate}
                        data-cy="cart-save-dates-btn"
                      >
                        {t.cart.booking.saveDates[lang]}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center my-1 flex-wrap gap-x-3 gap-y-1 justify-between">
                    <div className="flex items-center justify-end w-fit">
                      <p
                        className="text-md font-semibold mr-3"
                        data-cy="cart-timeframe-dates"
                      >
                        {formatDate(startDate, "d MMM yyyy")}
                        <span className="font-semibold"> -</span>{" "}
                        {formatDate(endDate, "d MMM yyyy")}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        data-cy="cart-rental-days"
                      >
                        ({rentalDays}{" "}
                        {rentalDays === 1
                          ? t.cart.booking.day[lang]
                          : t.cart.booking.days[lang]}{" "}
                        {t.cart.booking.total[lang]})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-amber-600" data-cy="cart-no-dates">
                {t.cart.booking.noDates[lang]}
              </p>
            )}
          </div>

          {/* Multiple Locations Notice */}
          {hasMultipleLocations && (
            <div
              className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6"
              data-cy="cart-multiple-locations-notice"
            >
              <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t.cart.locations.differentLocations[lang]}
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                {t.cart.locations.pickupInfo[lang]}
              </p>
              <ul className="space-y-2">
                {itemsByLocation.map((locationGroup, index) => (
                  <li
                    key={locationGroup.locationInfo.id}
                    className="text-blue-800 font-medium"
                    data-cy={`cart-location-item-${index}`}
                  >
                    {locationGroup.locationInfo.name}{" "}
                    <span className="text-blue-600 font-normal">
                      ({locationGroup.items.length}{" "}
                      {locationGroup.items.length === 1
                        ? t.cart.locations.itemCountSingular[lang]
                        : t.cart.locations.itemCount[lang]}
                      )
                    </span>
                    {locationGroup.locationInfo.address && (
                      <div className="text-xs text-gray-600 font-normal ml-2">
                        {locationGroup.locationInfo.address}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-4 p-2" data-cy="cart-items-list">
            {cartItems.map((cartItem) => {
              const itemContent = getTranslation(cartItem.item, lang) as
                | ItemTranslation
                | undefined;

              return (
                <div
                  key={cartItem.item.id}
                  className="flex flex-col border-b pb-2"
                  data-cy="cart-item"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1" data-cy="cart-item-name">
                        {itemContent?.item_name
                          .toLowerCase()
                          .replace(/^./, (c) => c.toUpperCase())}
                      </h3>
                      <p
                        className="text-xs text-slate-500 flex items-center gap-1"
                        data-cy="cart-item-location"
                      >
                        <MapPin className="h-3 w-3" />
                        {cartItem.item.location_details?.name ||
                          cartItem.item.location_name ||
                          "Unknown Location"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className="flex items-center"
                        data-cy="cart-item-quantity-section"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newQuantity = cartItem.quantity - 1;
                            if (newQuantity >= 1) {
                              dispatch(
                                updateQuantity({
                                  id: cartItem.item.id,
                                  quantity: newQuantity,
                                }),
                              );
                            }
                          }}
                          disabled={cartItem.quantity <= 1}
                          data-cy="cart-item-quantity-minus"
                        >
                          -
                        </Button>
                        <Input
                          type="text"
                          value={cartItem.quantity}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value, 10);
                            if (!isNaN(parsed) && parsed >= 1) {
                              // any positive quantity input, validation in handleQuantityChange
                              dispatch(
                                updateQuantity({
                                  id: cartItem.item.id,
                                  quantity: parsed,
                                }),
                              );
                            }
                          }}
                          className={`w-12 mx-2 text-center ${
                            availabilityMap[cartItem.item.id] &&
                            cartItem.quantity >
                              availabilityMap[cartItem.item.id]
                                .availableQuantity
                              ? "border-red-300 bg-red-50"
                              : ""
                          }`}
                          max={
                            availabilityMap[cartItem.item.id]?.availableQuantity
                          }
                          data-cy="cart-item-quantity-input"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.item.id,
                              cartItem.quantity + 1,
                            )
                          }
                          disabled={
                            cartItem.quantity >=
                            (availabilityMap[cartItem.item.id]
                              ?.availableQuantity ?? 0)
                          }
                          data-cy="cart-item-quantity-plus"
                        >
                          +
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs text-slate-400"
                          data-cy="cart-item-available"
                        >
                          {t.cart.item.available[lang]}{" "}
                          {availabilityMap[cartItem.item.id]?.isChecking
                            ? "..."
                            : (availabilityMap[cartItem.item.id]
                                ?.availableQuantity ?? "-")}{" "}
                          {t.cart.item.units[lang]}
                        </p>
                        {/* Availability warning */}
                        {availabilityMap[cartItem.item.id] &&
                          !availabilityMap[cartItem.item.id].isChecking &&
                          cartItem.quantity >
                            availabilityMap[cartItem.item.id]
                              .availableQuantity && (
                            <div
                              className="flex items-center gap-1 text-xs text-red-600"
                              data-cy="cart-item-availability-warning"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              <span>
                                {availabilityMap[cartItem.item.id]
                                  .availableQuantity === 0
                                  ? t.cart.item.unavailableForDates[lang]
                                  : t.cart.item.limitedAvailability[lang]}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="ml-2 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(cartItem.item.id)}
                        data-cy="cart-item-remove-btn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="flex flex-col w-full md:w-1/3 mt-6 md:mt-0 max-h-[80vh] overflow-y-auto sticky top-24"
          data-cy="cart-summary-section"
        >
          <div
            className="bg-slate-50 p-4 rounded-lg w-full mb-4"
            data-cy="cart-summary-box"
          >
            <h3 className="font-semibold mb-3" data-cy="cart-summary-title">
              {t.cart.summary.title[lang]}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t.cart.summary.rentalPeriod[lang]}</span>
                <span>
                  {rentalDays}{" "}
                  {rentalDays === 1
                    ? t.cart.booking.day[lang]
                    : t.cart.booking.days[lang]}
                </span>
              </div>
              <div
                className="border-t pt-2 mt-2 flex justify-between text-xs"
                data-cy="cart-summary-explanation"
              >
                <span className="mt-2">{t.cart.booking.explanation[lang]}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button Below Summary */}
          <TooltipPrimitive.Root>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary w-full"
                  disabled={
                    !startDate ||
                    !endDate ||
                    bookingLoading ||
                    cartItems.length === 0 ||
                    isCheckoutDisabled
                  }
                  onClick={handleCheckoutClick}
                  data-cy="cart-checkout-btn"
                >
                  {bookingLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      {t.cart.buttons.processing[lang]}
                    </>
                  ) : (
                    t.cart.buttons.checkout[lang]
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {isCheckoutDisabled && (
              <TooltipContent>
                <p>{t.cart.buttons.wrongRole[lang]}</p>
              </TooltipContent>
            )}
          </TooltipPrimitive.Root>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-row items-center justify-between gap-4"
        data-cy="cart-actions"
      >
        <Button
          onClick={handleClearCart}
          className="text-primary/50 bg-background rounded-2xl border-1 border-primary/50 hover:bg-primary hover:text-white md:ml-2"
          data-cy="cart-clear-btn"
        >
          {t.cart.buttons.clearCart[lang]}
        </Button>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onComplete={async (data) => {
          const success = await updateProfile(data);
          if (success) {
            // Refresh current user data to ensure profile is up to date
            try {
              await dispatch(getCurrentUser()).unwrap();
              const id =
                userProfile?.id ??
                (localStorage.getItem("userId") || undefined);
              if (id) {
                try {
                  await dispatch(getUserAddresses(id)).unwrap();
                } catch (e) {
                  if (process.env.NODE_ENV !== "production") {
                    console.error("Failed to refresh user addresses:", e);
                  }
                }
              }
            } catch (error) {
              console.warn("Failed to refresh user data:", error);
            }

            setIsProfileModalOpen(false);

            // Show success toast with a slight delay to avoid overlap
            setTimeout(() => {
              toast.success(t.cart.toast.profileUpdateSuccess[lang]);
            }, 100);

            return true;
          } else {
            toast.error(t.cart.toast.profileUpdateError[lang]);
            return false;
          }
        }}
      />
    </div>
  );
};

export default Cart;
