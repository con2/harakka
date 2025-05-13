import React from "react";
import { useAppSelector } from "../store/hooks";
import {
  selectCurrentOrder,
  selectOrdersLoading,
} from "../store/slices/ordersSlice";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, LoaderCircle } from "lucide-react";

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const order = useAppSelector(selectCurrentOrder);
  const isLoading = useAppSelector(selectOrdersLoading);

  return (
    <div className="container mx-auto p-8 max-w-md">
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Order Created!</h2>
        <p className="mb-4">
          Your order has been successfully placed. You will receive a
          confirmation email shortly.
        </p>
        {isLoading ? (
          <div className="bg-slate-50 p-4 rounded-md flex justify-center items-center mb-6 h-12">
            <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
            <span className="text-sm text-gray-600">
              Loading order details...
            </span>
          </div>
        ) : order ? (
          <div className="bg-slate-50 p-4 rounded-md text-left mb-6">
            <p>
              <span className="font-semibold">Order Number:</span>{" "}
              {order.order_number}
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-md text-left mb-6 text-amber-600">
            <p>Order details not available.</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/profile?tab=orders")}
            className="flex-1 bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => navigate("/storage")}
            className="flex-1 bg-background text-primary border-primary border hover:bg-primary hover:text-white"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
