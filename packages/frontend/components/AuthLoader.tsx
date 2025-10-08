// components/AuthLoader.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// 💡 NEW: Import UserInfo from apiClient for type safety
import { setUser, clearUser } from "@/store/userSlice";
import { UserInfo } from "@/utils/apiClient"; // 💡 NEW: Import UserInfo

export function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("token");
    const storedUserInfo = localStorage.getItem("userInfo");

    if (token && storedUserInfo) {
      try {
        const userInfo: UserInfo = JSON.parse(storedUserInfo); // 💡 MODIFIED: Type assertion for userInfo

        // 💡 CRITICAL MODIFICATION: Check for `totalPoints` in storedUserInfo
        // And dispatch `setUser` with the combined token and user info,
        // matching the *new* `setUser` payload in `userSlice.ts`.
        if (
          userInfo.id &&
          userInfo.username &&
          userInfo.email &&
          typeof userInfo.totalPoints === "number"
        ) {
          dispatch(
            setUser({
              id: userInfo.id,
              username: userInfo.username,
              email: userInfo.email,
              totalPoints: userInfo.totalPoints, // 💡 NEW: Include totalPoints
              token: token, // Re-use the token from localStorage
            })
          );
          console.log("AuthLoader: User state re-hydrated from localStorage.");
        } else {
          console.warn(
            "AuthLoader: Stored user info incomplete or totalPoints missing, clearing session."
          );
          dispatch(clearUser());
        }
      } catch (error) {
        console.error(
          "AuthLoader: Failed to parse user info from localStorage, clearing session.",
          error
        );
        dispatch(clearUser());
      }
    } else {
      console.log(
        "AuthLoader: No valid token or user info found in localStorage, ensuring Redux is cleared."
      );
      dispatch(clearUser());
    }

    setIsAuthLoaded(true);
  }, [dispatch]);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <p className="ml-64 p-8 text-white">Loading application...</p>
      </div>
    );
  }

  return <>{children}</>;
}
