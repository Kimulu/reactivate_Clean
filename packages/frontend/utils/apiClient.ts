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

// 💡 NEW: Helper function for authenticated fetches
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token missing.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // Add Authorization header
    ...options.headers,
  } as HeadersInit;

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Return specific backend message if available
    throw new Error(errorData?.message || `Failed API call: ${url}`);
  }

  return response;
};

export const apiClient = {
  loginUser: async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Login failed");
    }
    return res.json();
  },

  signupUser: async (username: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to signup");
    }
    return res.json();
  },

  // 💡 MODIFIED: Now uses authFetch for consistency and to ensure token is sent
  getUserById: async (id: string) => {
    const res = await authFetch(`/api/users/${id}`);
    return res.json();
  },

  getChallenges: async (): Promise<Challenge[]> => {
    // This endpoint is public, so no authFetch needed directly
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
    return res.json();
  },

  getChallengeById: async (challengeId: string): Promise<Challenge> => {
    // This endpoint is public
    const res = await fetch(`${BASE_URL}/api/challenges/${challengeId}`, {
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

  // 💡 NEW: Method to submit a challenge solution
  submitChallenge: async (
    challengeId: string,
    submittedCode: { [path: string]: string }
  ) => {
    const res = await authFetch(`/api/challenges/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify({ submittedCode }), // Backend expects { submittedCode: { '/App.js': '...' } }
    });
    return res.json();
  },

  // 💡 NEW: Method to get a list of completed challenge IDs for the current user
  getCompletedChallenges: async (): Promise<string[]> => {
    // Returns an array of challenge IDs (e.g., ["fragments", "counter"])
    const res = await authFetch(`/api/challenges/completed`, {
      method: "GET",
    });
    return res.json();
  },
};
