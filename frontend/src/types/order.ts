export interface Order {
    id: string;
    is_active: boolean;
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
}

export interface OrderState {
    orders: Order[];
    loading: boolean;
    error: string | null;
    selectedOrder: Order | null;
}


  // export interface BookingRequest {
  //   user_email?: string; // optional because for admin-booking
  //   items: Order[];
  // }
  