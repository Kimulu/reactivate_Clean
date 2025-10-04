// components/ProtectedRoute.tsx
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useEffect } from "react";

/**
 * Route Guard component to restrict access to authenticated users.
 * This version prioritizes hydration success by always rendering children
 * on the server, and handling redirection exclusively on the client.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Select the user state from Redux.
  // During SSR, this might be the initial (empty) state.
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // This useEffect hook runs ONLY on the client-side, AFTER the initial render (hydration).
  useEffect(() => {
    // Check if the user is NOT authenticated based on the client-side Redux state.
    // If the user object or its 'id' property is missing, redirect to the login page.
    if (!user || !user.id) {
      // Use router.replace to prevent the user from navigating back to the protected page
      // using the browser's back button after being redirected.
      router.replace("/Login");
    }
  }, [user, router]); // Dependencies: re-run this effect if 'user' or 'router' changes.

  // --- Crucial for Hydration Fix ---
  // Always render the children directly.
  // This ensures that the HTML structure rendered by the server (SSR)
  // for ProtectedRoute is identical to what the client expects (the children).
  // The client-side redirection (if necessary) will then occur via the useEffect
  // after the component has successfully hydrated.
  return <>{children}</>;
};
