import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice";
import { RootState } from "../store";

/**
 * AuthLoader component attempts to load user data from localStorage
 * into the Redux store immediately after the application loads.
 */
export const AuthLoader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();

  // Check if user is already loaded in Redux to prevent unnecessary localStorage access
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Only run this if the Redux state is currently empty (i.e., on initial app load/refresh)
    if (!user || !user.id) {
      try {
        // Check localStorage for the persistent user object
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Re-dispatch the user data to populate the Redux store
          dispatch(setUser(userData));
        }
      } catch (error) {
        // Handle corrupted data by clearing it
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [dispatch, user]);

  return <>{children}</>;
};
