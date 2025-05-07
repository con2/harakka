import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface UiState {
  itemModalState: {
    isOpen: boolean;
    currentStep: "details" | "images";
    createdItemId: string | null;
  };
}

const initialState: UiState = {
  itemModalState: {
    isOpen: false,
    currentStep: "details",
    createdItemId: null,
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openItemModal: (state) => {
      state.itemModalState.isOpen = true;
      state.itemModalState.currentStep = "details";
      state.itemModalState.createdItemId = null;
    },
    closeItemModal: (state) => {
      state.itemModalState.isOpen = false;
      state.itemModalState.currentStep = "details";
      state.itemModalState.createdItemId = null;
    },
    setItemModalStep: (state, action: PayloadAction<"details" | "images">) => {
      state.itemModalState.currentStep = action.payload;
    },
    setCreatedItemId: (state, action: PayloadAction<string>) => {
      state.itemModalState.createdItemId = action.payload;
    },
  },
});

export const {
  openItemModal,
  closeItemModal,
  setItemModalStep,
  setCreatedItemId,
} = uiSlice.actions;

export const selectItemModalState = (state: RootState) =>
  state.ui.itemModalState;

export default uiSlice.reducer;
