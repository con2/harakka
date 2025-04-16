import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectCartItems,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../store/slices/cartSlice';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  // Use global timeframe
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl mb-4">Your cart is empty</h2>
        <p>Add some items to your cart to see them here.</p>
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
    <div className="p-6">
      <h2 className="text-xl mb-4">Your Cart</h2>

      {/* Booking Timeframe Summary */}
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-2">
          <Calendar className="h-5 w-5 mr-2 text-secondary" />
          <h3 className="text-lg font-semibold">Booking Timeframe</h3>
        </div>
        {startDate && endDate ? (
          <div>
            <p className="text-md">
              <span className="font-medium">From:</span>{' '}
              {format(new Date(startDate), 'PPP')}
            </p>
            <p className="text-md">
              <span className="font-medium">To:</span>{' '}
              {format(new Date(endDate), 'PPP')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ({rentalDays} {rentalDays === 1 ? 'day' : 'days'} total)
            </p>
          </div>
        ) : (
          <p className="text-amber-600">
            No booking period selected. Please select dates first.
          </p>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((cartItem) => (
          <div key={cartItem.item.id} className="flex flex-col border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">
                  {cartItem.item.translations.fi.item_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {cartItem.item.translations.fi.item_type}
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
                    type="number"
                    value={cartItem.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        cartItem.item.id,
                        parseInt(e.target.value),
                      )
                    }
                    className="w-16 mx-2 text-center"
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
        ))}
      </div>

      {/* Order Summary */}
      <div className="mt-8 bg-slate-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items subtotal:</span>
            <span>€{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Rental period:</span>
            <span>
              {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>€{(cartTotal * rentalDays).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleClearCart}
          className="text-secondary border-secondary hover:bg-secondary hover:text-white"
        >
          Clear Cart
        </Button>
        <Button
          className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary flex-1"
          disabled={!startDate || !endDate}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
