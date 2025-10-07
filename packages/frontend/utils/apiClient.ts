// utils/apiClient.ts

// 💡 NEW: Define Challenge types (if not already defined in a global types file)
interface ChallengeFile {
  code: string;
  active?: boolean;
  hidden?: boolean;
}
export interface Challenge {
  // Export this interface to use in frontend components
  _id: string; // MongoDB's ID
  id: string; // Your custom challenge ID (e.g., "fragments")
  title: string;
  difficulty: string;
  instructions: string;
  files: { [key: string]: ChallengeFile };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

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

  signupUser: async (username: string, email: string, password: string) => {
    // Accept email
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }), // Send email in the body
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to signup");
    }

    return res.json(); // Return the parsed JSON directly for successful responses
  },

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

  // 💡 NEW: Method to fetch challenges from the backend
  getChallenges: async () => {
    // Challenges endpoint is currently public, so no token needed.
    // If you add authentication later, you'd add the Authorization header here.
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to fetch challenges");
    }

    return res.json(); // This will return an array of challenge objects
  },

  // 💡 NEW: Method to fetch a single challenge by its custom ID
  getChallengeById: async (challengeId: string): Promise<Challenge> => {
    const res = await fetch(`${BASE_URL}/api/challenges/${challengeId}`, {
      // Assuming backend has /api/challenges/:id
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Failed to fetch challenge with ID: ${challengeId}`
      );
    }
    return res.json();
  },
};
