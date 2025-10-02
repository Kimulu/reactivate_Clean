import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useEffect } from "react";

/**
 * Route Guard component to restrict access to authenticated users.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    // If user state is empty (not logged in), redirect to the login page
    // We only check for the 'id' which is set upon successful login/hydration
    if (!user || !user.id) {
      // Use replace to prevent the user from hitting the back button to view the page
      router.replace("/Login");
    }
  }, [user, router]);

  // Only render the children (the protected page content) if the user is authenticated.
  // Otherwise, return null or a loading state while redirecting.
  if (user && user.id) {
    return <>{children}</>;
  }

  return <p className="text-white p-8">Redirecting to login...</p>;
};
