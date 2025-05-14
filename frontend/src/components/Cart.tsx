import React from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  selectCartItems,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice";
import { createOrder, selectOrdersLoading } from "../store/slices/ordersSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, Calendar, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { toastConfirm } from "./ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useTranslation } from "@/hooks/useTranslation";
import { ItemTranslation } from "@/types";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const orderLoading = useAppSelector(selectOrdersLoading);
  const userProfile = useAppSelector(selectSelectedUser);
  const user = useAppSelector(selectSelectedUser);

  // Translation
  const { getTranslation } = useTranslation<ItemTranslation>();
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  // Get start and end dates from the timeframe Redux slice
  const { startDate: startDateStr, endDate: endDateStr } = useAppSelector(
    (state) => state.timeframe,
  );

  // Convert string dates to Date objects when needed
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
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

  const handleCheckout = async () => {
    if (!user) {
      toast.error(t.cart.toast.loginRequired[lang]);
      navigate("/login");
      return;
    }

    if (!userProfile || !userProfile.id) {
      toast.error(t.cart.toast.profileLoading[lang]);
      return;
    }

    //check to ensure valid user ID
    //console.log("Using user ID for order:", userProfile.id);

    // Try to read stored user ID from localStorage
    const storedUserId = localStorage.getItem("userId");
    //console.log("User ID in localStorage:", storedUserId);

    if (storedUserId !== userProfile.id) {
      // Synchronize the localStorage ID with profile ID
      localStorage.setItem("userId", userProfile.id);
      //console.log("Updated localStorage user ID to match profile");
    }

    if (!startDate || !endDate || cartItems.length === 0) {
      toast.error(t.cart.toast.selectDatesAndItems[lang]);
      return;
    }

    // Validate all items are within available quantity
    const invalidItems = cartItems.filter(
      (item) => item.quantity > item.item.items_number_available,
    );

    if (invalidItems.length > 0) {
      toast.error(t.cart.toast.itemsExceedQuantity[lang]);
      return;
    }

    // Format order data according to backend expectations
    const orderData = {
      user_id: userProfile.id,
      items: cartItems.map((item) => ({
        item_id: item.item.id,
        quantity: item.quantity,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })),
    };

    //console.log("User object:", user);
    //console.log("User ID:", user.id);

    try {
      await toast.promise(dispatch(createOrder(orderData)).unwrap(), {
        loading: t.cart.toast.creatingOrder[lang],
        success: t.cart.toast.orderCreated[lang],
        error: (err) =>
          `${t.cart.toast.orderError[lang]}${err || t.cart.toast.orderError[lang]}`,
      });

      // Clear cart after successful order
      dispatch(clearCart());

      // Navigate to orders page or confirmation
      navigate("/orders/confirmation");
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      console.error("Order data that failed:", orderData);
      toast.error(
        `Checkout error: ${
          error instanceof Error ? error.message : "Unknown error"
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
    <div className="w-full max-w-6xl mx-auto px-10 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
      <p className="text-xl mb-4 text-left pl-2 text-secondary">
        {t.cart.review.title[lang]}
      </p>
      <div className="flex flex-col md:flex-row gap-10 mb-2">
        <div className="flex flex-col flex-2/3">
          {/* Booking Timeframe Summary */}
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            {startDate && endDate ? (
              <div className="flex items-center my-1">
                <div className="flex items-center gap-2 flex-1/3">
                  <Calendar className="h-5 w-5 text-secondary" />
                  <span className="text-md">
                    {t.cart.booking.timeframe[lang]}
                  </span>
                </div>
                <div className="flex items-center justify-end flex-2/3">
                  <p className="text-md font-semibold mr-3">
                    {formatDate(startDate, "d MMM yyyy")}
                    <span className="font-semibold"> -</span>{" "}
                    {formatDate(endDate, "d MMM yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({rentalDays}{" "}
                    {rentalDays === 1
                      ? t.cart.booking.day[lang]
                      : t.cart.booking.days[lang]}{" "}
                    {t.cart.booking.total[lang]})
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-amber-600">{t.cart.booking.noDates[lang]}</p>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-4 p-2">
            {cartItems.map((cartItem) => {
              const itemContent = getTranslation(cartItem.item, lang) as
                | ItemTranslation
                | undefined;

              return (
                <div
                  key={cartItem.item.id}
                  className="flex flex-col border-b pb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">
                        {itemContent?.item_name
                          .toLowerCase()
                          .replace(/^./, (c) => c.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {itemContent?.item_type
                          .toLowerCase()
                          .replace(/^./, (c) => c.toUpperCase())}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t.cart.item.available[lang]}{" "}
                        {cartItem.item.items_number_available}{" "}
                        {t.cart.item.units[lang]}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.item.id,
                              cartItem.quantity - 1,
                            )
                          }
                        >
                          -
                        </Button>
                        <Input
                          type="text"
                          value={cartItem.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              cartItem.item.id,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-12 mx-2 text-center"
                          max={cartItem.item.items_number_available}
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
                            cartItem.item.items_number_available
                          }
                        >
                          +
                        </Button>
                      </div>
                      <div className="w-20 text-right">
                        €{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(cartItem.item.id)}
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
        <div className="flex flex-col w-full md:w-1/3 mt-6 md:mt-0 max-h-[80vh] overflow-y-auto sticky top-24">
          <div className="bg-slate-50 p-4 rounded-lg w-full mb-4">
            <h3 className="font-semibold mb-3">{t.cart.summary.title[lang]}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t.cart.summary.subtotal[lang]}</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t.cart.summary.rentalPeriod[lang]}</span>
                <span>
                  {rentalDays}{" "}
                  {rentalDays === 1
                    ? t.cart.booking.day[lang]
                    : t.cart.booking.days[lang]}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>{t.cart.summary.total[lang]}</span>
                <span>€{(cartTotal * rentalDays).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button Below Summary */}
          <Button
            className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary w-full"
            disabled={
              !startDate || !endDate || orderLoading || cartItems.length === 0
            }
            onClick={handleCheckout}
          >
            {orderLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                {t.cart.buttons.processing[lang]}
              </>
            ) : (
              t.cart.buttons.checkout[lang]
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Button
          onClick={handleClearCart}
          className="text-primary/50 bg-background rounded-2xl border-1 border-primary/50 hover:bg-primary hover:text-white ml-4"
        >
          {t.cart.buttons.clearCart[lang]}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
