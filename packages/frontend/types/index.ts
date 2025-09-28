// types/User.ts

export interface User {
  _id: string; // MongoDB's unique ID for the user
  username: string;
  // You might add fields like:
  // score: number;
  // rank: number;
  // completedChallenges: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
