// utils/apiClient.ts

interface ChallengeFile {
  code: string;
  active?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
}

export interface Challenge {
  _id: string;
  id: string;
  title: string;
  difficulty: string;
  instructions: string;
  files: { [key: string]: ChallengeFile };
  testCode: string;
  points: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TestResult {
  title: string;
  status: "passed" | "failed" | "skipped";
  message?: string;
}

export interface CustomTestRunResponse {
  passed: boolean;
  output: string;
  detailedResults: TestResult[];
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  totalPoints: number;
  createdAt: string | null;
}

export interface CompletedChallengeInfo {
  challengeId: string;
  pointsEarned: number;
}

export interface LeaderboardEntry {
  username: string;
  totalPoints: number;
}

export interface CommunityComment {
  _id: string;
  user: string;
  username: string;
  text: string;
  createdAt: string;
}

// 💡 MODIFIED INTERFACE: For CommunityPost, 'user' is now a populated object, not just an ID string
export interface CommunityPost {
  _id: string;
  user: {
    // 💡 MODIFIED: User is now a populated object
    _id: string;
    username: string;
    totalPoints: number;
    // Add other user fields if you fetch them, like email, createdAt if needed here
  };
  challenge?: {
    _id: string;
    id: string;
    title: string;
  };
  challengeId?: string;
  title: string;
  codeContent?: { [path: string]: string };
  body?: string;
  type: "solution" | "discussion";
  tags?: string[];
  comments: CommunityComment[];
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
  updatedAt: string;
  voteScore?: number; // 💡 NEW: Include voteScore from backend aggregate
}

export interface UserSubmissionDetails {
  submittedCode: { [path: string]: string };
  submittedAt: string;
  pointsEarned: number;
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
    console.error("Authentication token missing for protected route:", url);
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
    console.log(
      "apiClient: Attempting to fetch leaderboard with token via authFetch."
    ); // 💡 NEW LOG
    const res = await authFetch(`/api/users/leaderboard`, {
      // 💡 CRITICAL CHANGE: Use authFetch
      method: "GET",
      // authFetch already handles 'Content-Type' and 'Authorization' header
    });

    // authFetch will throw on !res.ok, so this if-block is technically redundant,
    // but we can keep it for consistent logging or extra processing if needed.
    // However, authFetch itself provides a more robust error message.
    if (!res.ok) {
      // This line will typically not be reached if authFetch throws first
      const errorData = await res.json().catch(() => null);
      console.error(
        "apiClient: Leaderboard fetch error data (after authFetch):",
        errorData
      );
      throw new Error(errorData?.message || "Failed to fetch leaderboard");
    }

    return res.json();
  },

  createCommunityPost: async (postData: {
    challenge?: string; // Challenge MongoDB _id
    challengeId?: string; // Challenge custom ID
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

  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    const res = await authFetch(`/api/community/posts`, {
      method: "GET",
    });
    return res.json();
  },

  getCommunityPostById: async (postId: string): Promise<CommunityPost> => {
    const res = await authFetch(`/api/community/posts/${postId}`, {
      method: "GET",
    });
    return res.json();
  },

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

  upvoteCommunityPost: async (
    postId: string
  ): Promise<{ message: string; upvotes: number; downvotes: number }> => {
    // 💡 MODIFIED: Removed postCreatorTotalPoints
    const res = await authFetch(`/api/community/posts/${postId}/upvote`, {
      method: "POST",
    });
    return res.json();
  },

  downvoteCommunityPost: async (
    postId: string
  ): Promise<{ message: string; upvotes: number; downvotes: number }> => {
    // 💡 MODIFIED: Removed postCreatorTotalPoints
    const res = await authFetch(`/api/community/posts/${postId}/downvote`, {
      method: "POST",
    });
    return res.json();
  },
  getUserChallengeSubmission: async (
    userId: string,
    challengeId: string
  ): Promise<UserSubmissionDetails> => {
    const res = await authFetch(
      `/api/users/${userId}/submissions/${challengeId}`,
      {
        method: "GET",
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Failed to fetch submission for challenge ${challengeId}.`
      );
    }
    return res.json();
  },

  // 💡 NEW: Get a specific user's highest points earned in a single challenge
  getHighestChallengeScore: async (
    userId: string
  ): Promise<{ highestScore: number }> => {
    const res = await authFetch(`/api/users/${userId}/highest-score`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Failed to fetch highest score for user ${userId}.`
      );
    }
    return res.json();
  },
  // 💡 NEW: Update user profile details
  updateUserProfile: async (
    userId: string,
    profileData: { username?: string; email?: string }
  ): Promise<{ message: string; user: UserInfo }> => {
    const res = await authFetch(`/api/users/${userId}/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // 💡 NEW: Update user password
  updateUserPassword: async (
    userId: string,
    passwordData: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> => {
    const res = await authFetch(`/api/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
    return res.json();
  },

  // 💡 NEW: Delete user account
  deleteUserAccount: async (userId: string): Promise<{ message: string }> => {
    const res = await authFetch(`/api/users/${userId}`, {
      method: "DELETE",
    });
    return res.json();
  },
};
