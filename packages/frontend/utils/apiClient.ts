// utils/apiClient.ts

interface ChallengeFile {
  code: string;
  active?: boolean;
  hidden?: boolean;
  readOnly?: boolean; // Added for completeness if your Sandpack files can be read-only
}

// 💡 MODIFIED: Challenge interface now includes 'testCode'
export interface Challenge {
  _id: string;
  id: string;
  title: string;
  difficulty: string;
  instructions: string;
  files: { [key: string]: ChallengeFile };
  testCode: string; // 💡 NEW FIELD: Challenge test code from backend
  points: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// 💡 NEW INTERFACE: For individual test results from your backend
export interface TestResult {
  title: string;
  status: "passed" | "failed" | "skipped";
  message?: string; // Optional: detailed error message for failed tests
}

// 💡 NEW INTERFACE: For the overall test run response from the backend
export interface CustomTestRunResponse {
  passed: boolean; // Overall pass/fail status
  output: string; // Raw console output from Jest
  detailedResults: TestResult[]; // Structured array of individual test results
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
    // Redirect to login or show an error if no token is found for an auth-protected route
    // In a real app, you might want a more sophisticated redirect or global error handling
    console.error("Authentication token missing for protected route:", url);
    // As a simple example, we'll throw, but consider a redirect here.
    throw new Error("Authentication required.");
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

  getCompletedChallenges: async (): Promise<CompletedChallengeInfo[]> => {
    const res = await authFetch(`/api/challenges/completed`, {
      method: "GET",
    });
    return res.json();
  },

  // 💡 NEW FUNCTION: To call your backend's custom test runner
  runUserTests: async (
    challengeId: string,
    userSolutionFiles: { [path: string]: string } // An object like { 'index.js': 'user code' }
  ): Promise<CustomTestRunResponse> => {
    const res = await authFetch(`/api/challenges/${challengeId}/run-tests`, {
      method: "POST",
      body: JSON.stringify({ userSolutionFiles }),
    });
    return res.json();
  },
};
