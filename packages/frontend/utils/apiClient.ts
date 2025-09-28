// utils/apiClient.ts

import { User } from "@/types/index";
import { AuthResponse } from "@/types/index";

const API_BASE_URL = "http://localhost:5000/api";

export const apiClient = {
  // Login function
  // Corrected login function to parse JSON data
  loginUser: async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    // Await and return the JSON data
    return response.json();
  },

  // Corrected function to send username and password
  signupUser: async (username: string, password: string): Promise<Response> => {
    return fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },

  // This function is defined to handle other API calls
  getUserProfile: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error("User not found.");
    }
    return response.json();
  },
};
