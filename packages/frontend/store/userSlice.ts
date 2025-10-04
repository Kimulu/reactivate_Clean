// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
}

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        id: string;
        username: string;
        email: string;
        token: string;
      }>
    ) => {
      console.log(
        "LOG: Redux Reducer setUser fired with payload:",
        action.payload
      );
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.token = action.payload.token;

      // 💡 FIX 1: Persist token to localStorage
      if (typeof window !== "undefined") {
        // Defensive check for SSR
        localStorage.setItem("token", action.payload.token);
        // 💡 FIX 2: Also persist relevant user info to localStorage
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: action.payload.id,
            username: action.payload.username,
            email: action.payload.email,
          })
        );
        console.log("LOG: Token and UserInfo stored in localStorage.");
      }
    },
    clearUser: (state) => {
      console.log("LOG: Redux Reducer clearUser (logout) fired.");
      state.id = null;
      state.username = null;
      state.email = null;
      state.token = null;

      // 💡 FIX 3: Clear both token and userInfo from localStorage during logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo"); // Clear user info as well
        console.log("LOG: Token and UserInfo removed from localStorage.");
      }
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
