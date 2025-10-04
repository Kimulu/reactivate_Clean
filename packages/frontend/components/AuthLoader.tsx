// components/AuthLoader.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/userSlice"; // Adjust path as needed

export function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // New state to manage loading

  useEffect(() => {
    // This effect runs ONLY on the client-side, AFTER the initial render
    if (typeof window === "undefined") {
      return; // Do nothing on the server
    }

    const token = localStorage.getItem("token");
    const storedUserInfo = localStorage.getItem("userInfo");

    if (token && storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);

        // 💡 Crucial Check: Ensure userInfo has all expected properties
        if (userInfo.id && userInfo.username && userInfo.email) {
          dispatch(
            setUser({
              id: userInfo.id,
              username: userInfo.username,
              email: userInfo.email,
              token: token, // Re-use the token from localStorage
            })
          );
          console.log("AuthLoader: User state re-hydrated from localStorage.");
        } else {
          // If userInfo is incomplete, clear everything
          console.warn(
            "AuthLoader: Stored user info incomplete, clearing session."
          );
          dispatch(clearUser());
        }
      } catch (error) {
        console.error(
          "AuthLoader: Failed to parse user info from localStorage, clearing session.",
          error
        );
        dispatch(clearUser()); // Clear if JSON parsing fails
      }
    } else {
      // If token or userInfo is missing, ensure Redux state is cleared
      console.log(
        "AuthLoader: No valid token or user info found in localStorage, ensuring Redux is cleared."
      );
      dispatch(clearUser());
    }

    setIsAuthLoaded(true); // Mark authentication loading as complete
  }, [dispatch]); // Depend on dispatch to avoid unnecessary re-runs

  // 💡 Optional: You can show a loading spinner while authentication state is being re-hydrated
  // if you want to prevent a flicker or content jump.
  // For now, we'll just render children directly, assuming it's quick.
  if (!isAuthLoaded) {
    // You could render a minimal loading spinner here
    // For now, return children directly to avoid blank screen or flicker
    // and rely on ProtectedRoute to handle redirection if still unauthenticated.
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <p className="ml-64 p-8 text-white">Loading application...</p>
      </div>
    );
  }

  return <>{children}</>;
}
