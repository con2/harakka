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

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Your Cart</h2>
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

                {/* Booking dates display */}
                {(cartItem.startDate || cartItem.endDate) && (
                  <div className="mt-2 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {cartItem.startDate
                        ? format(new Date(cartItem.startDate), 'PPP')
                        : 'No start date'}
                      {' - '}
                      {cartItem.endDate
                        ? format(new Date(cartItem.endDate), 'PPP')
                        : 'No end date'}
                    </span>
                  </div>
                )}
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

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex justify-between font-medium">
          <span>Total:</span>
          <span>€{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="text-secondary border-secondary hover:bg-secondary hover:text-white"
          >
            Clear Cart
          </Button>
          <Button className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary flex-1">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
