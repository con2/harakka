import {
    Injectable,
    BadRequestException,
    ForbiddenException,
  } from '@nestjs/common';
  import { SupabaseService } from './supabase.service';
  import { CreateBookingDto } from '../dto/create-booking.dto';
  
  @Injectable()
  export class BookingService {
    constructor(private readonly supabaseService: SupabaseService) {}
  
    // get all orders
    // get all orders
async getAllOrders() {
    const supabase = this.supabaseService.getServiceClient();
  
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          storage_items (
            translations
          )
        )
      `);
  
    if (error) {
      console.error('Supabase error in getAllOrders():', error);
      throw new BadRequestException('Could not load orders');
    }
  
    if (!orders || orders.length === 0) {
      throw new BadRequestException('No orders found');
    }
  
    // hole für jeden Auftrag das zugehörige User-Profil (per user_id)
    const ordersWithUserProfiles = await Promise.all(
      orders.map(async (order) => {
        let user: { name: string; email: string } | null = null;
        if (order.user_id) {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('name, email')
            .eq('id', order.user_id)
            .maybeSingle();
          user = userData ?? null;
        }
  
        // item_name aus dem translations JSON ziehen
        const enrichedItems = order.order_items?.map((item) => ({
          ...item,
          item_name: item.storage_items?.translations?.en?.item_name ?? 'Unknown',
        })) ?? [];
  
        return {
          ...order,
          user_profile: user,
          order_items: enrichedItems,
        };
      })
    );
  
    return ordersWithUserProfiles;
  }
  
      
    // create a Booking
    async createBooking(dto: CreateBookingDto, requestingUserEmail: string) {
      const supabase = this.supabaseService.getServiceClient();
      const userEmail = dto.user_email ?? requestingUserEmail;
  
      const { data: user } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userEmail)
        .single();
  
      if (!user) throw new BadRequestException('User not found');
  
      const unavailableItems: string[] = [];
  
      for (const item of dto.items) {
        const { data: itemData } = await supabase
          .from('storage_items')
          .select('items_number_available')
          .eq('id', item.item_id)
          .single();
  
        if (!itemData || itemData.items_number_available < item.quantity) {
          unavailableItems.push(item.item_id);
        }
      }
  
      if (unavailableItems.length > 0) {
        throw new BadRequestException(
          `Not enough items available: ${unavailableItems.join(', ')}`,
        );
      }
  
      // New order
      const { data: order } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();
  
      for (const item of dto.items) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          item_id: item.item_id,
          quantity: item.quantity,
          start_date: item.start_date,
          end_date: item.end_date,
        });
      }
  
      return order;
    }

    // confirm a Booking
    async confirmBooking(orderId: string) {
        const supabase = this.supabaseService.getServiceClient();
  
    // get the items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('item_id, quantity')
      .eq('order_id', orderId);
  
    if (itemsError) throw new BadRequestException('Could not load order items');
  
    // change status - trigger functions in supabase handle: check stock and take items away
    const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId);

  if (updateError) {
    throw new BadRequestException('Could not confirm booking');
  }

  return { message: 'Booking confirmed' };
}
  // don't delete the order, just change the status to 'rejected' or 'cancelled' TODO!

    // reject a Booking
    async rejectBooking(orderId: string) {
      const supabase = this.supabaseService.getServiceClient();
  
      // Delete order + cancel items if necessary
      const { data: items } = await supabase
        .from('order_items')
        .select('item_id, quantity')
        .eq('order_id', orderId);
  
      if (items) {
        for (const item of items) {
          await supabase.rpc('increment_item_quantity', {
            item_id: item.item_id,
            quantity: item.quantity,
          });
        }
      }
  
      await supabase.from('orders').delete().eq('id', orderId);
      return { message: 'Booking rejected and removed' };
    }

    // cancel a Booking
    async cancelBooking(orderId: string, userId: string) {
      const supabase = this.supabaseService.getServiceClient();
  
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, status')
        .eq('id', orderId)
        .single();
  
      if (!order) throw new BadRequestException('Order not found');
  
      // identify roles
      const { data: user } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();
  
      const isAdmin = user?.role === 'admin' || user?.role === 'superVera';
      const isOwner = order.user_id === userId;
  
      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('You are not allowed to cancel this booking');
      }
  
      if (!isAdmin && order.status === 'confirmed') {
        throw new ForbiddenException('This booking has already been confirmed');
      }
  
      // Book items back
      const { data: items } = await supabase
        .from('order_items')
        .select('item_id, quantity')
        .eq('order_id', orderId);
  
      if (items) {
        for (const item of items) {
          await supabase.rpc('increment_item_quantity', {
            item_id: item.item_id,
            quantity: item.quantity,
          });
        }
      }
  
      await supabase.from('orders').delete().eq('id', orderId);
      return { message: 'Booking cancelled' };
    }
  }
// This service handles the logic for creating, confirming, rejecting, and cancelling bookings.  