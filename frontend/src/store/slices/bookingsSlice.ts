import {
  createEntityAdapter,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { bookingsApi } from "../../api/services/bookings";
import { RootState } from "../store";
import {
  BookingOrder,
  BookingItem,
  BookingsState,
  CreateBookingDto,
  PaymentStatus,
  ValidBookingOrder,
  BookingStatus,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";

// Create an entity adapter for bookings
const bookingsAdapter = createEntityAdapter<BookingOrder, string>({
  selectId: (e) => e.id,
  sortComparer: (a, b) => {
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    return bTime - aTime;
  },
});

// Create initial state
const initialState = bookingsAdapter.getInitialState<
  Omit<BookingsState, "entities" | "ids">
>({
  userBookings: [],
  loading: false,
  error: null,
  errorContext: null,
  currentBooking: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
});

// Create booking thunk
export const createBooking = createAsyncThunk<BookingOrder, CreateBookingDto>(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      return await bookingsApi.createBooking(bookingData);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create booking"),
      );
    }
  },
);

// Get user bookings thunk
export const getUserBookings = createAsyncThunk(
  "bookings/getUserBookings",
  async (
    { user_id, page, limit }: { user_id: string; page: number; limit: number },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getUserBookings(user_id, page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user bookings"),
      );
    }
  },
);
// Get user bookings thunk
export const getOrderedBookings = createAsyncThunk(
  "bookings/getOrderedBookings",
  async (
    {
      ordered_by = "booking_number",
      ascending = true,
      page = 1,
      limit = 10,
      searchquery,
      status_filter,
    }: {
      ordered_by: ValidBookingOrder;
      page: number;
      limit: number;
      searchquery: string;
      ascending?: boolean;
      status_filter?: BookingStatus;
    },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getOrderedBookings(
        ordered_by,
        ascending,
        page,
        limit,
        searchquery,
        status_filter,
      );
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch ordered bookings"),
      );
    }
  },
);

// Get all bookings thunk
export const getAllBookings = createAsyncThunk(
  "bookings/getAllBookings",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getAllBookings(page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch all bookings"),
      );
    }
  },
);

// Confirm booking thunk
export const confirmBooking = createAsyncThunk<
  { message: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/confirmBooking", async (bookingId, { rejectWithValue }) => {
  try {
    // The backend returns { message: "Booking confirmed" }
    const response = await bookingsApi.confirmBooking(bookingId);

    // Make sure we return the expected type
    return {
      ...response, // This contains the message from backend
      bookingId: bookingId, // add the bookingId
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to confirm booking"),
    );
  }
});

// Update booking thunk
export const updateBooking = createAsyncThunk<
  BookingOrder,
  { bookingId: string; items: BookingItem[] }
>(
  "bookings/updateBooking",
  async ({ bookingId, items }, { rejectWithValue }) => {
    try {
      return await bookingsApi.updateBooking(bookingId, items);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update booking"),
      );
    }
  },
);

// Reject booking thunk
export const rejectBooking = createAsyncThunk<
  { message: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/rejectBooking", async (bookingId, { rejectWithValue }) => {
  try {
    // The backend returns { message: "Booking rejected" }
    const response = await bookingsApi.rejectBooking(bookingId);

    // Make sure we return the expected type
    return {
      ...response, // This contains the message from backend
      bookingId: bookingId, // We add the bookingId ourselves
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to reject booking"),
    );
  }
});

// Cancel booking thunk
export const cancelBooking = createAsyncThunk<
  { message?: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/cancelBooking", async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingsApi.cancelBooking(bookingId);

    // Always add the bookingId to the response
    return {
      message: response.message || "Booking cancelled successfully",
      bookingId: bookingId, // add the bookingId
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to cancel booking"),
    );
  }
});

// Delete booking thunk
export const deleteBooking = createAsyncThunk<string, string>(
  "bookings/deleteBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await bookingsApi.deleteBooking(bookingId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete booking"),
      );
    }
  },
);

// Return items thunk
export const returnItems = createAsyncThunk<
  { bookingId: string },
  string,
  { rejectValue: string }
>("bookings/returnItems", async (bookingId, { rejectWithValue }) => {
  try {
    await bookingsApi.returnItems(bookingId); // Just fire and forget
    return { bookingId };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to process returns"),
    );
  }
});

// update Payment Status thunk
export const updatePaymentStatus = createAsyncThunk<
  { bookingId: string; status: PaymentStatus },
  { bookingId: string; status: PaymentStatus }
>(
  "bookings/payment-status",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.updatePaymentStatus(bookingId, status);
      // Ensure the returned status is of type PaymentStatus
      return {
        bookingId,
        status: response.status as PaymentStatus,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update the payment status"),
      );
    }
  },
);

export const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
      state.errorContext = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.id;
        bookingsAdapter.addOne(state, action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "create";
      })
      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload.data ?? [];
        state.total = action.payload.metadata.total;
        state.page = action.payload.metadata.page;
        state.totalPages = action.payload.metadata.totalPages;
        bookingsAdapter.setAll(state, action.payload.data ?? []);
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      // Get ordered bookings
      .addCase(getOrderedBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getOrderedBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload.data ?? [];
        state.total = action.payload.metadata.total;
        state.page = action.payload.metadata.page;
        state.totalPages = action.payload.metadata.totalPages;
        bookingsAdapter.setAll(state, action.payload.data ?? []);
      })
      .addCase(getOrderedBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      // Get all booking
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.total = action.payload.metadata.total;
        state.page = action.payload.metadata.page;
        state.totalPages = action.payload.metadata.totalPages;
        bookingsAdapter.setAll(state, action.payload.data ?? []);
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      // Confirm booking
      .addCase(confirmBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Use the bookingId from payload
        const bookingId = action.payload.bookingId;

        // Update the booking status in the normalized state
        bookingsAdapter.updateOne(state, {
          id: bookingId,
          changes: { status: "confirmed" },
        });

        // Also update in the user bookings array
        state.userBookings = state.userBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "confirmed" }
            : booking,
        );
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "confirm";
      })
      // Update booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        bookingsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.userBookings = state.userBookings.map((booking) =>
          booking.id === action.payload.id ? action.payload : booking,
        );
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      // Reject booking
      .addCase(rejectBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Use the bookingId from payload
        const bookingId = action.payload.bookingId;

        // Update the booking status in the normalized state
        bookingsAdapter.updateOne(state, {
          id: bookingId,
          changes: { status: "rejected" },
        });

        // Also update in the user bookings array
        state.userBookings = state.userBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "rejected" }
            : booking,
        );
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "reject";
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;

        // Use the bookingId we added to the payload
        const bookingId = action.payload.bookingId;

        // Update the booking status in the normalized state
        bookingsAdapter.updateOne(state, {
          id: bookingId,
          changes: { status: "cancelled by user" },
        });

        // Also update in the user bookings array
        state.userBookings = state.userBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled by user" }
            : booking,
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "cancel";
      })
      // Delete booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        bookingsAdapter.removeOne(state, action.payload);
        state.userBookings = state.userBookings.filter(
          (booking) => booking.id !== action.payload,
        );
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      })
      // Return items
      .addCase(returnItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(returnItems.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId } = action.payload;

        bookingsAdapter.updateOne(state, {
          id: bookingId,
          changes: { status: "completed" },
        });

        state.userBookings = state.userBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "completed" }
            : booking,
        );
      })
      .addCase(returnItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "return";
      })
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, status } = action.payload;

        // Update the booking in the normalized state
        bookingsAdapter.updateOne(state, {
          id: bookingId,
          changes: { payment_status: status as BookingOrder["payment_status"] },
        });
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update-payment-status";
      });
  },
});

// Export actions
export const { clearCurrentBooking } = bookingsSlice.actions;

// Export selectors
const bookingSelectors = bookingsAdapter.getSelectors<RootState>(
  (state) => state.bookings,
);

// Export selectors
export const selectAllBookings = bookingSelectors.selectAll;
export const selectBookingById = bookingSelectors.selectById;
export const selectBookingIds = bookingSelectors.selectIds;
export const selectCurrentBooking = (state: RootState) =>
  state.bookings.currentBooking
    ? selectBookingById(state, state.bookings.currentBooking)
    : null;
export const selectBookingLoading = (state: RootState) =>
  state.bookings.loading;
export const selectBookingError = (state: RootState) => state.bookings.error;
export const selectBookingErrorContext = (state: RootState) =>
  state.bookings.errorContext;
export const selectbookingErrorWithContext = (state: RootState) => ({
  message: state.bookings.error,
  context: state.bookings.errorContext,
});
export const selectBookingTotal = bookingSelectors.selectTotal;
export const selectUserBookings = (state: RootState) =>
  state.bookings.userBookings;

// Pagination data
export const selectBookingPage = (state: RootState) => state.bookings.page;
export const selectBookingLimit = (state: RootState) => state.bookings.limit;
export const selectBookingTotalData = (state: RootState) =>
  state.bookings.total;
export const selectBookingTotalPages = (state: RootState) =>
  state.bookings.totalPages;

// Export reducer
export default bookingsSlice.reducer;
