import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingsApi } from "../../api/services/bookings";
import { RootState } from "../store";
import {
  BookingsState,
  CreateBookingDto,
  CreateBookingResponse,
  BookingStatus,
  BookingPreview,
  BookingWithDetails,
  ValidBookingOrder,
  ExtendedBookingPreview,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { BookingItemUpdate } from "@common/bookings/booking-items.types";
import { Booking } from "@common/bookings/booking.types";
import { selectActiveOrganizationId, selectActiveRoleName } from "./rolesSlice";

// Create initial state
const initialState: BookingsState = {
  bookings: [],
  userBookings: [],
  loading: false,
  error: null,
  errorContext: null,
  currentBooking: null,
  currentBookingLoading: false,
  bookings_pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  booking_items_pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  bookingsCount: 0,
};

// Create booking thunk
export const createBooking = createAsyncThunk<
  CreateBookingResponse,
  CreateBookingDto
>("bookings/createBooking", async (bookingData, { rejectWithValue }) => {
  try {
    return await bookingsApi.createBooking(bookingData);
  } catch (error: unknown) {
    // For profile incomplete errors, preserve the full error structure
    const apiError = error as {
      response?: {
        data?: {
          errorCode?: string;
          message?: string;
          missingFields?: string[];
          hasPhone?: boolean;
        };
      };
    };
    if (apiError?.response?.data?.errorCode === "PROFILE_INCOMPLETE") {
      return rejectWithValue(apiError.response.data);
    }

    if (apiError?.response?.data?.message) {
      return rejectWithValue(apiError.response.data.message);
    }

    // For other errors, use the standard error message extraction
    return rejectWithValue(
      extractErrorMessage(error, "Failed to create booking"),
    );
  }
});

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

// Get my bookings thunk
export const getOwnBookings = createAsyncThunk(
  "bookings/getOwnBookings",
  async (
    {
      page = 1,
      limit = 10,
    }: {
      page?: number;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      return await bookingsApi.getOwnBookings(page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch own bookings"),
      );
    }
  },
);

// get booking by ID
export const getBookingByID = createAsyncThunk(
  "bookings/getBookingByID",
  async (booking_id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const roleName = selectActiveRoleName(state);
      const isElevated = roleName === "super_admin";
      const orgId = isElevated
        ? undefined
        : selectActiveOrganizationId(state) || undefined;
      if (orgId) {
        return await bookingsApi.getBookingByID(booking_id, orgId);
      } else {
        return await bookingsApi.getBookingByID(booking_id, "");
      }
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user bookings"),
      );
    }
  },
);

// get booking count (all bookings, active and inactive)
export const getBookingsCount = createAsyncThunk(
  "bookings/getBookingsCount",
  async (_, { rejectWithValue }) => {
    try {
      return await bookingsApi.getBookingsCount();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch bookings count"),
      );
    }
  },
);

// get items for a booking
export const getBookingItems = createAsyncThunk(
  "bookings/getBookingItems",
  async (booking_id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const roleName = selectActiveRoleName(state);
      const isElevated = roleName === "super_admin";
      const orgId = isElevated
        ? undefined
        : selectActiveOrganizationId(state) || undefined;
      return await bookingsApi.getBookingItems(
        booking_id,
        ["translations"],
        orgId,
      );
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
      ordered_by = "created_at",
      ascending = false,
      page = 1,
      limit = 10,
      searchquery,
      status_filter,
    }: {
      ordered_by: ValidBookingOrder;
      page: number;
      limit: number;
      searchquery?: string;
      ascending?: boolean;
      status_filter?: BookingStatus;
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as RootState;
      const roleName = selectActiveRoleName(state);
      const isElevated = roleName === "super_admin";
      const orgId = isElevated
        ? undefined
        : selectActiveOrganizationId(state) || undefined;
      return await bookingsApi.getOrderedBookings(
        ordered_by,
        ascending,
        page,
        limit,
        searchquery,
        status_filter,
        orgId,
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
  Booking,
  { bookingId: string; items: BookingItemUpdate[] }
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

// Confirm booking items for the active organization
export const confirmBookingForOrg = createAsyncThunk<
  { message: string; bookingId: string },
  string,
  { rejectValue: string }
>(
  "bookings/confirmForOrg",
  async (bookingId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const orgId = selectActiveOrganizationId(state);
      if (!orgId) throw new Error("No active organization selected");
      const response = await bookingsApi.confirmBookingForOrg(bookingId, orgId);
      return { ...response, bookingId };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to confirm booking items for org"),
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

// Reject booking items for the active organization
export const rejectBookingForOrg = createAsyncThunk<
  { message: string; bookingId: string },
  string,
  { rejectValue: string }
>("bookings/rejectForOrg", async (bookingId, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState;
    const orgId = selectActiveOrganizationId(state);
    if (!orgId) throw new Error("No active organization selected");
    const response = await bookingsApi.rejectBookingForOrg(bookingId, orgId);
    return { ...response, bookingId };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to reject booking items for org"),
    );
  }
});

// Update a single booking item status for the active organization
// Confirm selected items for active org (or all if none provided)
export const confirmItemsForOrg = createAsyncThunk<
  { message: string; bookingId: string; updatedIds?: string[] },
  { bookingId: string; itemIds?: string[] },
  { rejectValue: string }
>(
  "bookings/confirmItemsForOrg",
  async ({ bookingId, itemIds }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const orgId = selectActiveOrganizationId(state);
      if (!orgId) throw new Error("No active organization selected");
      const response = await bookingsApi.confirmItemsForOrg(
        bookingId,
        orgId,
        itemIds,
      );
      return { ...response, bookingId, updatedIds: itemIds };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to confirm items for org"),
      );
    }
  },
);

// Reject selected items for active org (or all if none provided)
export const rejectItemsForOrg = createAsyncThunk<
  { message: string; bookingId: string; updatedIds?: string[] },
  { bookingId: string; itemIds?: string[] },
  { rejectValue: string }
>(
  "bookings/rejectItemsForOrg",
  async ({ bookingId, itemIds }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const orgId = selectActiveOrganizationId(state);
      if (!orgId) throw new Error("No active organization selected");
      const response = await bookingsApi.rejectItemsForOrg(
        bookingId,
        orgId,
        itemIds,
      );
      return { ...response, bookingId, updatedIds: itemIds };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to reject items for org"),
      );
    }
  },
);

// Return items thunk
export const returnItems = createAsyncThunk<
  {
    bookingId: string;
    itemIds?: string[];
    location_id?: string;
    org_id?: string;
  },
  {
    bookingId: string;
    itemIds?: string[];
    location_id?: string;
    org_id?: string;
  },
  { rejectValue: string }
>(
  "bookings/returnItems",
  async ({ bookingId, itemIds, location_id, org_id }, { rejectWithValue }) => {
    try {
      await bookingsApi.returnItems(bookingId, itemIds, location_id, org_id);
      return { bookingId, itemIds, location_id };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to process returns"),
      );
    }
  },
);

// Mark items as picked up
export const pickUpItems = createAsyncThunk<
  {
    bookingId: string;
    location_id?: string;
    org_id?: string;
    itemIds?: string[];
  },
  {
    bookingId: string;
    location_id?: string;
    org_id?: string;
    itemIds?: string[];
  },
  { rejectValue: string }
>(
  "bookings/pickUpItems",
  async ({ bookingId, location_id, org_id, itemIds }, { rejectWithValue }) => {
    try {
      await bookingsApi.pickUpItems(bookingId, location_id, org_id, itemIds);
      return { bookingId, location_id, org_id, itemIds };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to process returns"),
      );
    }
  },
);

// Mark items as picked up
export const updateSelfPickup = createAsyncThunk<
  { bookingId: string; location_id: string; newStatus: boolean },
  { bookingId: string; location_id: string; newStatus: boolean },
  { rejectValue: string }
>(
  "bookings/updateSelfPickup",
  async ({ bookingId, location_id, newStatus }, { rejectWithValue }) => {
    try {
      await bookingsApi.updateSelfPickup(bookingId, location_id, newStatus);
      return { bookingId, location_id, newStatus };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to process returns"),
      );
    }
  },
);

// Mark items as cancelled up
export const cancelBookingItems = createAsyncThunk<
  { bookingId: string; itemIds?: string[] },
  { bookingId: string; itemIds?: string[] },
  { rejectValue: string }
>(
  "bookings/cancelBookingItems",
  async ({ bookingId, itemIds }, { rejectWithValue }) => {
    try {
      await bookingsApi.cancelBookingItems(bookingId, itemIds);
      return { bookingId };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to process returns"),
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
    clearCurrentBookingItems: (state) => {
      if (state.currentBooking) state.currentBooking.booking_items = null;
      state.error = null;
      state.errorContext = null;
    },
    clearUserBookings: (state) => {
      state.userBookings = [];
      state.error = null;
      state.errorContext = null;
    },
    selectBooking: (state, action) => {
      state.currentBooking = action.payload;
      if (state.currentBooking && "booking_items" in state.currentBooking)
        state.currentBooking.booking_items = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookingsCount.fulfilled, (state, action) => {
        state.bookingsCount = action.payload.data!;
      })
      .addCase(getBookingsCount.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.error = null;
        state.errorContext = null;
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        // Store the detailed booking for the confirmation page
        state.currentBooking = action.payload.booking;
        // Don't add to bookings list - let getUserBookings handle that properly
        state.loading = false;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "create";
        state.loading = false;
      })
      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.userBookings = action.payload
          .data as unknown as ExtendedBookingPreview[];
        state.bookings_pagination = action.payload.metadata;
        state.loading = false;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Get own bookings
      .addCase(getOwnBookings.pending, (state) => {
        state.loading = true; // Set loading to true while fetching
        state.error = null; // Clear any previous errors
        state.errorContext = null;
      })
      .addCase(getOwnBookings.fulfilled, (state, action) => {
        if (action.payload) {
          state.userBookings = action.payload.data as ExtendedBookingPreview[];
          state.bookings_pagination = action.payload.metadata;
        } else {
          state.userBookings = [];
        }
        state.loading = false;
      })
      .addCase(getOwnBookings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Confirm items for org (all or selected)
      .addCase(confirmItemsForOrg.fulfilled, (state, action) => {
        if (!state.currentBooking || !state.currentBooking.booking_items)
          return;
        const updatedIds = action.payload.updatedIds || [];
        state.currentBooking.booking_items =
          state.currentBooking.booking_items.map((bi) =>
            updatedIds.length === 0 || updatedIds.includes(bi.id)
              ? { ...bi, status: "confirmed" }
              : bi,
          );
        // Roll-up with new rule
        const allRejected =
          state.currentBooking.booking_items.length > 0 &&
          state.currentBooking.booking_items.every(
            (bi) => bi.status === "rejected",
          );
        const noPending =
          state.currentBooking.booking_items.length > 0 &&
          state.currentBooking.booking_items.every(
            (bi) => bi.status !== "pending",
          );
        let rolledUpStatus: BookingStatus = "pending";
        if (allRejected) rolledUpStatus = "rejected";
        else if (noPending) rolledUpStatus = "confirmed";
        state.currentBooking.status = rolledUpStatus;
        const currentId = state.currentBooking.id;
        if (currentId) {
          state.bookings.forEach((b) => {
            if (b.id === currentId) b.status = rolledUpStatus;
          });
          state.userBookings.forEach((b) => {
            if (b.id === currentId) b.status = rolledUpStatus;
          });
        }
      })
      .addCase(confirmItemsForOrg.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      // Reject items for org (all or selected)
      .addCase(rejectItemsForOrg.fulfilled, (state, action) => {
        if (!state.currentBooking || !state.currentBooking.booking_items)
          return;
        const updatedIds = action.payload.updatedIds || [];
        state.currentBooking.booking_items =
          state.currentBooking.booking_items.map((bi) =>
            updatedIds.length === 0 || updatedIds.includes(bi.id)
              ? { ...bi, status: "rejected" }
              : bi,
          );
        // Roll-up with new rule
        const allRejected =
          state.currentBooking.booking_items.length > 0 &&
          state.currentBooking.booking_items.every(
            (bi) => bi.status === "rejected",
          );
        const noPending =
          state.currentBooking.booking_items.length > 0 &&
          state.currentBooking.booking_items.every(
            (bi) => bi.status !== "pending",
          );
        let rolledUpStatus: BookingStatus = "pending";
        if (allRejected) rolledUpStatus = "rejected";
        else if (noPending) rolledUpStatus = "confirmed";
        state.currentBooking.status = rolledUpStatus;
        const currentId = state.currentBooking.id;
        if (currentId) {
          state.bookings.forEach((b) => {
            if (b.id === currentId) b.status = rolledUpStatus;
          });
          state.userBookings.forEach((b) => {
            if (b.id === currentId) b.status = rolledUpStatus;
          });
        }
      })
      .addCase(rejectItemsForOrg.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      // Get booking by ID
      .addCase(getBookingByID.pending, (state) => {
        state.currentBookingLoading = true;
        state.currentBooking = null;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getBookingByID.fulfilled, (state, action) => {
        if (action.payload && "data" in action.payload && action.payload.data) {
          state.currentBooking = action.payload.data as BookingWithDetails;
          state.booking_items_pagination = action.payload.metadata;
        } else {
          state.currentBooking = null;
        }
        state.currentBookingLoading = false;
      })
      .addCase(getBookingByID.rejected, (state, action) => {
        state.error = action.payload as string;
        state.currentBookingLoading = false;
      })
      .addCase(getBookingItems.pending, (state) => {
        state.currentBookingLoading = true;
        if (state.currentBooking && "booking_items" in state.currentBooking)
          state.currentBooking.booking_items = null;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getBookingItems.fulfilled, (state, action) => {
        if (state.currentBooking) {
          state.currentBooking.booking_items = action.payload.data;
          if (action.payload.data && action.payload.data.length === 0)
            state.currentBooking.booking_items = null;
        }
        state.booking_items_pagination = action.payload.metadata;
        state.currentBookingLoading = false;
      })
      .addCase(getBookingItems.rejected, (state, action) => {
        state.error = action.payload as string;
        state.currentBookingLoading = false;
      })
      // Get ordered bookings
      .addCase(getOrderedBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getOrderedBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data ?? [];
        state.bookings_pagination = action.payload.metadata;
        state.loading = false;
      })
      .addCase(getOrderedBookings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      // Get all booking
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings_pagination = action.payload.metadata;
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

        // Also update in the bookings array
        state.bookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "confirmed";
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "confirmed";
          }
        });
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "confirm";
      })
      // Confirm for org
      .addCase(confirmBookingForOrg.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(confirmBookingForOrg.fulfilled, (state, action) => {
        state.loading = false;
        const bookingId = action.payload.bookingId;
        // If the backend rolled up to confirmed, reflect that where present
        state.bookings.forEach((b) => {
          if (b.id === bookingId && b.status === "pending") {
            // stay pending unless the backend set confirmed via refetch elsewhere
          }
        });
      })
      .addCase(confirmBookingForOrg.rejected, (state, action) => {
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

        state.bookings.forEach((booking) => {
          if (booking.id === action.payload.id) {
            Object.assign(booking, action.payload);
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === action.payload.id) {
            Object.assign(booking, action.payload);
          }
        });
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

        // Also update in the user bookings array
        state.bookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "rejected";
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "rejected";
          }
        });
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "reject";
      })
      // Reject for org
      .addCase(rejectBookingForOrg.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(rejectBookingForOrg.fulfilled, (state, _action) => {
        state.loading = false;
      })
      .addCase(rejectBookingForOrg.rejected, (state, action) => {
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

        // Also update in the user bookings array
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "cancelled";
          }
        });
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
        state.userBookings = state.userBookings.filter(
          (booking: Booking | BookingPreview) => booking.id !== action.payload,
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

        state.bookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "completed";
          }
        });
        state.userBookings.forEach((booking) => {
          if (booking.id === bookingId) {
            booking.status = "completed";
          }
        });
      })
      .addCase(returnItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "return";
      })
      // Pick up items
      .addCase(pickUpItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(pickUpItems.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(pickUpItems.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "patch";
        state.loading = false;
      })
      // Cancel booking items
      .addCase(cancelBookingItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(cancelBookingItems.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelBookingItems.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "patch";
        state.loading = false;
      })
      // Update Self-Pickup Status
      .addCase(updateSelfPickup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateSelfPickup.fulfilled, (state, action) => {
        state.loading = false;
        const { newStatus, location_id } = action.payload;
        const items = state.currentBooking?.booking_items ?? [];
        state.currentBooking = {
          ...(state.currentBooking ?? {}),
          booking_items: items.map((item) =>
            item.location_id === location_id
              ? { ...item, self_pickup: newStatus }
              : item,
          ),
        };
      })
      .addCase(updateSelfPickup.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "patch";
        state.loading = false;
      });
  },
});

// Export actions
export const {
  clearCurrentBooking,
  selectBooking,
  clearCurrentBookingItems,
  clearUserBookings,
} = bookingsSlice.actions;

// // Export selectors
export const selectAllBookings = (state: RootState) => state.bookings.bookings;
export const selectCurrentBooking = (state: RootState) =>
  state.bookings.currentBooking;
export const selectCurrentBookingLoading = (state: RootState) =>
  state.bookings.currentBookingLoading;
export const selectBookingLoading = (state: RootState) =>
  state.bookings.loading;
export const selectBookingError = (state: RootState) => state.bookings.error;
export const selectBookingErrorContext = (state: RootState) =>
  state.bookings.errorContext;
export const selectbookingErrorWithContext = (state: RootState) => ({
  message: state.bookings.error,
  context: state.bookings.errorContext,
});
export const selectUserBookings = (state: RootState) =>
  state.bookings.userBookings;

// Pagination data
export const selectBookingPagination = (state: RootState) =>
  state.bookings.bookings_pagination;
export const selectBookingItemsPagination = (state: RootState) =>
  state.bookings.booking_items_pagination;
export const selectTotalBookingsCount = (state: RootState) =>
  state.bookings.bookingsCount;

// Export reducer
export default bookingsSlice.reducer;
