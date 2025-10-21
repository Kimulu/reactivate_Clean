// store/challengeSlice.ts (Create this file)

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Challenge } from "@/utils/apiClient"; // Import Challenge interface

interface ChallengeState {
  allChallenges: Challenge[];
  loading: boolean;
  error: string | null;
}

const initialState: ChallengeState = {
  allChallenges: [],
  loading: false,
  error: null,
};

const challengeSlice = createSlice({
  name: "challenges",
  initialState,
  reducers: {
    setAllChallenges: (state, action: PayloadAction<Challenge[]>) => {
      state.allChallenges = action.payload;
    },
    setChallengesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setChallengesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAllChallenges, setChallengesLoading, setChallengesError } =
  challengeSlice.actions;
export default challengeSlice.reducer;
