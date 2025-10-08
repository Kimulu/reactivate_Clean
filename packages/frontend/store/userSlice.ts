// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// 💡 NEW: Import UserInfo interface from apiClient for type safety
import { UserInfo } from "@/utils/apiClient";

interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
  totalPoints: number; // 💡 NEW FIELD: User's total points
}

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  token: null,
  totalPoints: 0, // 💡 NEW: Initialize totalPoints to 0
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 💡 CRITICAL FIX: The payload now matches what your `Login.tsx` and `AuthLoader.tsx`
    // (based on your provided code) currently pass.
    // It is a direct combination of user details and token.
    setUser: (state, action: PayloadAction<UserInfo & { token: string }>) => {
      // 💡 MODIFIED: Payload type
      console.log(
        "LOG: Redux Reducer setUser fired with payload:",
        action.payload
      );
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.totalPoints = action.payload.totalPoints; // 💡 NEW: Set totalPoints

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        // 💡 MODIFIED: Store relevant user info (excluding token) for re-hydration.
        // AuthLoader will combine token + userInfo for setUser.
        const { token, ...userInfoToStore } = action.payload; // Destructure token out
        localStorage.setItem("userInfo", JSON.stringify(userInfoToStore));
        console.log("LOG: Token and UserInfo stored in localStorage.");
      }
    },
    // 💡 NEW: Action to update only the totalPoints field in Redux
    updateUserTotalPoints: (state, action: PayloadAction<number>) => {
      state.totalPoints = action.payload;
      // Also update localStorage userInfo for persistence
      if (
        typeof window !== "undefined" &&
        state.id &&
        state.username &&
        state.email
      ) {
        const currentUserInfo: UserInfo = {
          id: state.id,
          username: state.username,
          email: state.email,
          totalPoints: action.payload, // Update points
        };
        localStorage.setItem("userInfo", JSON.stringify(currentUserInfo));
      }
      console.log(`LOG: User totalPoints updated to ${action.payload}`);
    },
    clearUser: (state) => {
      console.log("LOG: Redux Reducer clearUser (logout) fired.");
      state.id = null;
      state.username = null;
      state.email = null;
      state.token = null;
      state.totalPoints = 0; // 💡 NEW: Reset totalPoints on logout

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        console.log("LOG: Token and UserInfo removed from localStorage.");
      }
    },
  },
});

// 💡 MODIFIED: Export new action
export const { setUser, updateUserTotalPoints, clearUser } = userSlice.actions;
export default userSlice.reducer;
