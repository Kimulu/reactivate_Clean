// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { setUser } from "./userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Hydrate user on refresh
if (typeof window !== "undefined") {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    const parsed = JSON.parse(savedUser);
    store.dispatch(setUser(parsed));
  }
}
