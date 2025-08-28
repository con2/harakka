import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface UiState {
  itemModalState: {
    isOpen: boolean;
    currentStep: "details" | "images";
    createdItemId: string | null;
  };
  stepperState: {
    currentStep: number;
  };
  redirectUrl: string;
}

const initialState: UiState = {
  itemModalState: {
    isOpen: false,
    currentStep: "details",
    createdItemId: null,
  },
  stepperState: {
    currentStep: 1,
  },
  redirectUrl: "",
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
    setStepper: (state, action) => {
      state.stepperState.currentStep = action.payload;
    },
    setNextStep: (state) => {
      state.stepperState.currentStep = state.stepperState.currentStep + 1;
    },
    setPrevStep: (state) => {
      state.stepperState.currentStep = state.stepperState.currentStep - 1;
    },
    setRedirectUrl: (state, action) => {
      state.redirectUrl = action.payload;
    },
  },
});

export const {
  openItemModal,
  closeItemModal,
  setItemModalStep,
  setCreatedItemId,
  setStepper,
  setNextStep,
  setPrevStep,
  setRedirectUrl,
} = uiSlice.actions;

export const selectItemModalState = (state: RootState) =>
  state.ui.itemModalState;
export const stepperCurrentNum = (state: RootState) =>
  state.ui.stepperState.currentStep;
export const redirectUrl = (state: RootState) => state.ui.redirectUrl;

export default uiSlice.reducer;
