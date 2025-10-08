// utils/apiClient.ts

interface ChallengeFile {
  code: string;
  active?: boolean;
  hidden?: boolean;
}

export interface Challenge {
  _id: string;
  id: string;
  title: string;
  difficulty: string;
  instructions: string;
  files: { [key: string]: ChallengeFile };
  points: number; // 💡 NEW FIELD: Challenges now have a 'points' field
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// 💡 NEW INTERFACE: To explicitly define the user info structure from backend auth (including totalPoints)
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  totalPoints: number; // 💡 NEW FIELD: User's total points
}

// 💡 NEW INTERFACE: For the data returned by getCompletedChallenges
export interface CompletedChallengeInfo {
  challengeId: string;
  pointsEarned: number; // 💡 NEW FIELD: Points earned for this specific challenge
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token.trim() === "") {
    return null;
  }
  return token;
};

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token missing.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
    throw new Error(errorData?.message || `Failed API call: ${url}`);
  }

  return response;
};

export const apiClient = {
  // 💡 MODIFIED: loginUser return type includes UserInfo
  loginUser: async (
    username: string,
    password: string
  ): Promise<{ token: string; user: UserInfo }> => {
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

  // 💡 MODIFIED: signupUser return type includes UserInfo
  signupUser: async (
    username: string,
    email: string,
    password: string
  ): Promise<{ token: string; user: UserInfo }> => {
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

  // 💡 MODIFIED: getUserById return type is UserInfo
  getUserById: async (id: string): Promise<UserInfo> => {
    const res = await authFetch(`/api/users/${id}`);
    return res.json();
  },

  getChallenges: async (): Promise<Challenge[]> => {
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

  // 💡 MODIFIED: submitChallenge returns message, submission, and updated userPoints
  submitChallenge: async (
    challengeId: string,
    submittedCode: { [path: string]: string }
  ): Promise<{ message: string; submission: any; userPoints: number }> => {
    const res = await authFetch(`/api/challenges/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify({ submittedCode }),
    });
    return res.json();
  },

  // 💡 MODIFIED: getCompletedChallenges now returns an array of CompletedChallengeInfo
  getCompletedChallenges: async (): Promise<CompletedChallengeInfo[]> => {
    const res = await authFetch(`/api/challenges/completed`, {
      method: "GET",
    });
    return res.json();
  },
};
