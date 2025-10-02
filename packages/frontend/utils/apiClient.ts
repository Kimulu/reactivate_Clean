// utils/apiClient.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem("token");

export const apiClient = {
  // Login method using native fetch
  loginUser: async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      // 💡 FIX: Added /api prefix to match server.js
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null); // 💡 IMPROVEMENT: Use the specific message from the server response (e.g., "Invalid credentials")
      throw new Error(errorData?.message || "Login failed");
    }

    return res.json();
  },

  signupUser: async (username: string, password: string) => {
    // 💡 FIX: Added /api prefix to match server.js
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to signup");
    }

    return res.json();
  }, // Protected route method

  getUserById: async (id: string) => {
    const token = getToken(); // Retrieve the token
    if (!token) throw new Error("Authentication token missing.");

    // 💡 FIX: Added /api prefix and Authorization header
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Pass the JWT
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to fetch user");
    }

    return res.json();
  },
};
