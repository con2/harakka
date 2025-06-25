import { Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { NewOrderItemDto } from "./dto/new-order-item.dto";
import { AuthenticatedRequest } from "src/middleware/Auth.middleware";
import { OrderItemsService } from "./order-items.service";

@Controller("order-items")
export class OrderItemsController {
  constructor(private readonly orderService: OrderItemsService) {}

  /**
   * Get all order-items (booked items) from backend 
   * @param req 
   * @returns 
   */
  @Get()
  async getAllOrderItems(
    @Req() req: AuthenticatedRequest,
  ) {
    const supabase = req.supabase;
    return await this.orderService.getAll(supabase);
  }

  /**
   * Get order-items of a certain booking
   * @param req 
   * @param order_id The ID of the order
   * @returns 
   */
  @Get(":order_id")
  async getOrderItems(@Req() req: AuthenticatedRequest, @Param() order_id: string) {
    const supabase = req.supabase;
    return await this.orderService.getOrderItems(supabase, order_id);
  }


  /**
   * Endpoint to create a new order-item
   * @param req 
   * @param order_item 
   * @returns 
   */
  @Post()
  async createOrderItem(
    @Req() req: AuthenticatedRequest,
    order_item: NewOrderItemDto,
  ) {
    const supabase = req.supabase;
    return await this.orderService.createOrderItem(supabase, order_item);
  }
}
