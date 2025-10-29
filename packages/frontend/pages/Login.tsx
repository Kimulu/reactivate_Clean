"use client";

import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setUser } from "@/store/userSlice";
import { apiClient } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { motion, Variants } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const inputBorderVariants: Variants = {
    default: { borderColor: "rgba(255,255,255,0.1)" },
    invalid: { borderColor: "#ef4444" },
    valid: { borderColor: "#22c55e" },
  };

  const getAnimationState = (touched: boolean, valid: boolean) => {
    if (touched) return valid ? "valid" : "invalid";
    return "default";
  };

  const validateUsername = (username: string) => username.length >= 3;
  const validatePassword = (password: string) => password.length >= 6;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameTouched(true);
    setIsUsernameValid(validateUsername(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(true);
    setIsPasswordValid(validatePassword(value));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    setUsernameTouched(true);
    setPasswordTouched(true);

    const usernameValid = validateUsername(username);
    const passwordValid = validatePassword(password);

    setIsUsernameValid(usernameValid);
    setIsPasswordValid(passwordValid);

    if (!usernameValid || !passwordValid) {
      setApiError("Please correct the errors before logging in.");
      return;
    }

    try {
      setLoading(true);
      const data = await apiClient.loginUser(username, password);

      if (
        data.token &&
        data.user &&
        data.user.id &&
        data.user.username &&
        data.user.email &&
        typeof data.user.totalPoints === "number"
      ) {
        dispatch(
          setUser({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            totalPoints: data.user.totalPoints,
            token: data.token,
          })
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            totalPoints: data.user.totalPoints,
            token: data.token,
          })
        );

        toast.success("Login successful!");
        router.push("/challenges");
      } else {
        toast.error("Login failed: Invalid server response.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setApiError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23] px-4">
      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#1a1a2e]/80 p-8 sm:p-10 rounded-xl shadow-2xl border border-white/10 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center font-mono gradient-text">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Animated Error Notification */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative mb-4 p-4 sm:p-5 text-center text-sm sm:text-base font-semibold 
                         text-red-100 bg-red-600/20 border border-red-500 rounded-lg 
                         shadow-md shadow-red-900/40 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="text-red-400" size={18} />
                <span>{apiError}</span>
              </div>

              <motion.div
                className="absolute inset-0 rounded-lg border border-red-400/40"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Username
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                ref={usernameRef}
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => {
                  setUsernameTouched(true);
                  setIsUsernameValid(validateUsername(username));
                }}
                placeholder="Enter your username"
                className="w-full px-10 py-2 bg-[#0f0f23]/60 border rounded-lg text-white 
                           focus:outline-none transition duration-200"
                variants={inputBorderVariants}
                animate={getAnimationState(usernameTouched, isUsernameValid)}
                initial={false}
              />
              {usernameTouched &&
                (isUsernameValid ? (
                  <CheckCircle
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                    size={18}
                  />
                ) : (
                  <AlertCircle
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                    size={18}
                  />
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

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  setPasswordTouched(true);
                  setIsPasswordValid(validatePassword(password));
                }}
                placeholder="Enter your password"
                className="w-full px-10 py-2 bg-[#0f0f23]/60 border rounded-lg text-white 
                           focus:outline-none transition duration-200"
                variants={inputBorderVariants}
                animate={getAnimationState(passwordTouched, isPasswordValid)}
                initial={false}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white focus:outline-none"
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

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#25a96d] text-[#0f0f23] font-bold py-3 
                       rounded-lg hover:from-[#25a96d] hover:to-[#06ffa5] transition-all duration-300 
                       shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} /> Signing
                in...
              </>
            ) : (
              <>
                <LogIn className="mr-2" size={18} /> Sign In
              </>
            )}
          </motion.button>
        </form>

        {/* Sign up link */}
        <p className="mt-6 text-center text-white/50 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/Signup")}
            className="text-[#06ffa5] hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );
}
