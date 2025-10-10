// store/sandpackSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SandpackFiles } from "@codesandbox/sandpack-react"; // 💡 NEW: Import SandpackFiles type

interface SandpackState {
  files: SandpackFiles; // The files object that SandpackProvider will consume
}

const initialState: SandpackState = {
  files: {}, // Start with an empty object
};

const sandpackSlice = createSlice({
  name: "sandpack",
  initialState,
  reducers: {
    // Action to set or update the Sandpack files
    setSandpackFiles: (state, action: PayloadAction<SandpackFiles>) => {
      state.files = action.payload;
      console.log(
        "Redux: Sandpack files updated.",
        Object.keys(action.payload)
      );
    },
    // You might add an action to reset files to initial challenge files later
  },
});

export const { setSandpackFiles } = sandpackSlice.actions;
export default sandpackSlice.reducer;
