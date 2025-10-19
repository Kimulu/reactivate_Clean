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

// 💡 NEW INTERFACE: For a single entry on the leaderboard
export interface LeaderboardEntry {
  username: string;
  totalPoints: number;
}
// 💡 NEW INTERFACE: For a Comment on a Community Post
export interface CommunityComment {
  _id: string;
  user: string; // User ID
  username: string; // Denormalized username
  text: string;
  createdAt: string;
}

// 💡 NEW INTERFACE: For a Community Post (Solution or Discussion)
export interface CommunityPost {
  _id: string;
  user: {
    _id: string;
    username: string;
    totalPoints: number;
  }; // Populated user info
  challenge?: {
    _id: string;
    id: string;
    title: string;
  }; // Optional: Populated challenge info if it's a solution
  challengeId?: string;
  title: string;
  codeContent?: { [path: string]: string }; // For solution posts
  body?: string; // For discussion posts or solution descriptions
  type: "solution" | "discussion";
  tags?: string[];
  comments: CommunityComment[];
  upvotes: string[]; // Array of user IDs
  downvotes: string[]; // Array of user IDs
  createdAt: string;
  updatedAt: string;
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

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    console.log("apiClient: Attempting to fetch leaderboard with token."); // 💡 NEW LOG
    const res = await authFetch(`/api/users/leaderboard`, {
      // 💡 CRITICAL CHANGE: Use authFetch
      method: "GET",
      // authFetch already sets Content-Type and Authorization header
    });

    // We keep the error handling consistent with other authFetch calls
    // The error will now likely be from the backend if token is invalid/expired etc.
    if (!res.ok) {
      // This check is technically redundant as authFetch throws on !res.ok, but kept for clarity/safety.
      const errorData = await res.json().catch(() => null);
      console.error("apiClient: Leaderboard fetch error data:", errorData);
      throw new Error(errorData?.message || "Failed to fetch leaderboard");
    }

    return res.json();
  },

  createCommunityPost: async (postData: {
    challenge?: string;
    challengeId?: string;
    title: string;
    codeContent?: { [path: string]: string };
    body?: string;
    type: "solution" | "discussion";
    tags?: string[];
  }): Promise<{ message: string; post: CommunityPost }> => {
    const res = await authFetch(`/api/community/posts`, {
      method: "POST",
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  // 💡 FIX: Use authFetch for getCommunityPosts
  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    console.log("apiClient: Attempting to fetch community posts with token."); // 💡 NEW LOG
    const res = await authFetch(`/api/community/posts`, {
      // 💡 CRITICAL CHANGE: Use authFetch
      method: "GET",
      // authFetch handles headers
    });
    return res.json();
  },

  // 💡 FIX: Use authFetch for getCommunityPostById
  getCommunityPostById: async (postId: string): Promise<CommunityPost> => {
    console.log(
      `apiClient: Attempting to fetch community post ${postId} with token.`
    ); // 💡 NEW LOG
    const res = await authFetch(`/api/community/posts/${postId}`, {
      // 💡 CRITICAL CHANGE: Use authFetch
      method: "GET",
      // authFetch handles headers
    });
    return res.json();
  },

  // 💡 NEW: Add a comment to a community post
  addCommunityComment: async (
    postId: string,
    text: string
  ): Promise<{ message: string; comment: CommunityComment }> => {
    const res = await authFetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // 💡 NEW (Optional): Upvote a post
  upvoteCommunityPost: async (
    postId: string
  ): Promise<{ message: string; upvotes: number; downvotes: number }> => {
    const res = await authFetch(`/api/community/posts/${postId}/upvote`, {
      method: "POST",
    });
    return res.json();
  },

  // 💡 NEW (Optional): Downvote a post
  downvoteCommunityPost: async (
    postId: string
  ): Promise<{ message: string; upvotes: number; downvotes: number }> => {
    const res = await authFetch(`/api/community/posts/${postId}/downvote`, {
      method: "POST",
    });
    return res.json();
  },
};
