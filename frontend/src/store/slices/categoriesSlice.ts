import { categoriesApi } from "@/api/services/categories";
import { CategoriesState } from "@/types/categories";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { extractErrorMessage } from "../utils/errorHandlers";
import { CategoryInsert, CategoryUpdate } from "@common/items/categories";
import { RootState } from "../store";

/*-----------------INITIAL STATE----------------------------------------------*/

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  errorContext: null,
};

/*-----------------ASYNC THUNKS----------------------------------------------*/
export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAllCategories",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      return await categoriesApi.getAllCategories(page, limit);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch categories"),
      );
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (newCategory: CategoryInsert, { rejectWithValue }) => {
    try {
      return await categoriesApi.createCategory(newCategory);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create category"),
      );
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (
    { id, updateCategory }: { id: string; updateCategory: CategoryUpdate },
    { rejectWithValue },
  ) => {
    try {
      return await categoriesApi.updateCategory(id, updateCategory);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update category"),
      );
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      return await categoriesApi.deleteCategory(id);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete category"),
      );
    }
  },
);

/*-----------------SLICE----------------------------------------------*/

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get Categories
    builder.addCase(fetchAllCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAllCategories.fulfilled, (state, action) => {
      state.categories = action.payload.data;
      state.loading = false;
    });
    builder.addCase(fetchAllCategories.rejected, (state, action) => {
      state.errorContext = "fetch";
      state.error =
        typeof action.payload === "string"
          ? action.payload
          : "Fetch All Categories Failed";
      state.loading = false;
    });

    // Create Category
    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createCategory.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.errorContext = "create";
      state.error =
        typeof action.payload === "string"
          ? action.payload
          : "Create Category Failed";
      state.loading = false;
    });

    // Update Category
    builder.addCase(updateCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCategory.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.errorContext = "update";
      state.error =
        typeof action.payload === "string"
          ? action.payload
          : "Update Category Failed";
      state.loading = false;
    });

    // Delete Category
    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteCategory.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.errorContext = "delete";
      state.error =
        typeof action.payload === "string"
          ? action.payload
          : "Delete Category Failed";
      state.loading = false;
    });
  },
});

/*-----------------SELECTORS----------------------------------------------*/

export const selectCategories = (state: RootState) =>
  state.categories.categories;
export const selectCategoriesLoading = (state: RootState) =>
  state.categories.loading;
export const selectCategoriesError = (state: RootState) =>
  state.categories.error;

export default categoriesSlice.reducer;
