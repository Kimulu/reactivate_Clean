// pages/Signup.tsx
"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient } from "../utils/apiClient";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { motion, Variants } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

const Signup = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Animation variants for input borders
  const inputBorderVariants: Variants = {
    default: { borderColor: "rgba(255, 255, 255, 0.1)" },
    invalid: { borderColor: "#ef4444" },
    valid: { borderColor: "#22c55e" },
  };

  const getAnimationState = (touched: boolean, valid: boolean) => {
    if (touched) return valid ? "valid" : "invalid";
    return "default";
  };

  // Validation functions
  const validateUsername = (name: string) => name.length >= 3;
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (pass: string) => pass.length >= 6;

  // Input change handlers
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameTouched(true);
    setIsUsernameValid(validateUsername(value));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailTouched(true);
    setIsEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(true);
    setIsPasswordValid(validatePassword(value));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    // Mark all fields as touched to trigger validation messages
    setUsernameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    // Re-validate all fields
    const isFormValid =
      validateUsername(username) &&
      validateEmail(email) &&
      validatePassword(password);

    setIsUsernameValid(validateUsername(username));
    setIsEmailValid(validateEmail(email));
    setIsPasswordValid(validatePassword(password));

    if (!isFormValid) {
      setApiError("Please correct the errors before signing up.");
      return;
    }

    setLoading(true);
    try {
      const responseData = await apiClient.signupUser(
        username,
        email,
        password
      );
      console.log("User signed up. Response Data:", responseData);

      if (
        responseData.token &&
        responseData.user &&
        typeof responseData.user.totalPoints === "number"
      ) {
        dispatch(
          setUser({
            id: responseData.user.id,
            username: responseData.user.username,
            email: responseData.user.email,
            totalPoints: responseData.user.totalPoints,
            token: responseData.token,
          })
        );
      }

      toast.success("Signed up successfully! 🎉");
      router.push("/challenges");
    } catch (error: unknown) {
      console.error("An error occurred during signup:", error);
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "An error occurred. Please try again later.";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23] p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-[#1a1a2e]/80 border border-white/10"
      >
        <h1 className="text-4xl font-extrabold text-white mb-6 text-center font-mono gradient-text">
          Sign Up
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center justify-center gap-2 p-4 text-center text-sm font-semibold text-red-100 bg-red-600/20 border border-red-500 rounded-lg"
            >
              <AlertCircle className="text-red-400" size={18} />
              <span>{apiError}</span>
            </motion.div>
          )}

          {/* Username Input */}
          <div>
            <label
              className="block text-sm font-semibold text-white/70 mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => setUsernameTouched(true)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f0f23] border text-white  focus:outline-none transition duration-200"
                placeholder="Enter your username"
                variants={inputBorderVariants}
                animate={getAnimationState(usernameTouched, isUsernameValid)}
                initial={false}
              />
              {usernameTouched &&
                (isUsernameValid ? (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                ))}
            </div>
            {usernameTouched && !isUsernameValid && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs mt-1"
              >
                Username must be at least 3 characters long.
              </motion.p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              className="block text-sm font-semibold text-white/70 mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setEmailTouched(true)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f0f23] border text-white  focus:outline-none transition duration-200"
                placeholder="Enter your email"
                variants={inputBorderVariants}
                animate={getAnimationState(emailTouched, isEmailValid)}
                initial={false}
              />
              {emailTouched &&
                (isEmailValid ? (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                ))}
            </div>
            {emailTouched && !isEmailValid && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs mt-1"
              >
                Please enter a valid email address.
              </motion.p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              className="block text-sm font-semibold text-white/70 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f0f23] border text-white focus:outline-none transition duration-200"
                placeholder="Create a password"
                variants={inputBorderVariants}
                animate={getAnimationState(passwordTouched, isPasswordValid)}
                initial={false}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordTouched && !isPasswordValid && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs mt-1"
              >
                Password must be at least 6 characters long.
              </motion.p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#25a96d] text-[#0f0f23] font-bold py-3 rounded-lg hover:from-[#25a96d] hover:to-[#06ffa5] transition-all duration-300 shadow-lg flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} /> Signing
                Up...
              </>
            ) : (
              <>
                <UserPlus className="mr-2" size={18} /> Sign Up
              </>
            )}
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/Login" className="text-[#06ffa5] hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
