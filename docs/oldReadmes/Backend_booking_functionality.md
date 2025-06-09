## 🧠 BookingService — Developer Docs

created by chatGPT

This service handles everything related to bookings: creating them, confirming, rejecting, updating, checking availability, and even returning items. It wraps all Supabase logic behind nice, readable methods so that higher-level components can focus on business logic instead of database wrangling.

All methods rely on a Supabase client initialized with role-based access (getClientByRole(userId)). That gives us the right permissions depending on the user making the request.
🔄 getAllOrders(userId: string)

Fetches all orders from the orders table with nested order_items, their associated storage_items, translations, and location info.

    Also fetches user profile data (full_name, email) for each order.

    Transforms each order item to include item_name and location_name.

Throws:

    BadRequestException if no orders found or Supabase fails.

🙋‍♂️ getUserBookings(userId: string)

Fetches all bookings made by a single user, sorted by created_at DESC.

    Adds item_name and location_name for each item.

    Aggregates unique location_ids and resolves them from storage_locations.

Returns:

    An array of bookings with pretty data.

Throws:

    BadRequestException if something goes wrong or userId is invalid.

🧾 createBooking(dto: CreateBookingDto)

This one’s doing the heavy lifting. Validates, checks for overlaps, inserts new order + order items.

Key steps:

    Validates user and checks if storage items are available for the given time range.

    Generates a unique order number (ORD-yyyyMMdd-xxxx).

    Inserts the order into orders.

    Iterates over each item in the booking:

        Calculates total_days

        Fetches location_id

        Inserts into order_items

Throws:

    BadRequestException if any validation, overlap check, or insert fails.

✅ confirmBooking(orderId: string, userId: string)

Marks a booking as confirmed. But first, it checks:

    Are there enough items available?

    If yes, it:

        Deducts the quantities in storage_items

        Updates the order + its items to confirmed

Throws:

    If item quantity isn’t enough or any DB operation fails.

✍️ updateBooking(orderId: string, userId: string, updatedItems: any[])

Admin or the booking owner can update an existing booking.

What it does:

    Permission check — only admin/superVera or the user who made the booking.

    Deletes all current order_items for that booking.

    Re-inserts new order_items with the updated info.

Returns:

    { message: "Booking updated" }

❌ rejectBooking(orderId: string, userId: string)

Admin-only method. Updates the order’s status to "rejected".

Throws:

    If the user isn’t an admin or something goes wrong.

🛑 cancelBooking(orderId: string, userId: string)

Allows users to cancel their own bookings (but only if not confirmed). Admins can always cancel.

Updates:

    Order status to "cancelled by admin" or "cancelled by user".

Throws:

    If permission or status rules are violated.

🧽 deleteBooking(orderId: string, userId: string)

Admin-only: Soft-deletes a booking.

Steps:

    Deletes all associated order_items

    Marks order status as "deleted"

🔁 returnItems(orderId: string, userId: string)

When items are returned, we increase stock via a stored procedure (increment_item_quantity).

Runs through each order_item and updates the quantity accordingly.

Returns:

    { message: "Items returned successfully" }

📆 checkAvailability(itemId, startDate, endDate, userId)

Checks how many items are available for a date range.

Steps:

    Gets sum of all booked quantities that overlap with the range.

    Fetches items_number_total from storage_items.

    Returns available count.

Notes

    All methods use Supabase's maybeSingle(), single() or select().eq() to fetch specific entries.

    Expect helpful logs on the console if something breaks (but you can mute those if you want to make it quieter).

    There’s room to add invoice logic if needed (see TODO in createBooking).

    Permissions are based on roles: "admin", "superVera", "service_role" or the booking owner.
