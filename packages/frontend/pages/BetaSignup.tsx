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
  FlaskConical,
  Code,
  Github,
  FileText,
} from "lucide-react";

const BetaSignup = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // user credentials
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // developer info
  const [language, setLanguage] = useState("");
  const [experience, setExperience] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [github, setGithub] = useState("");
  const [motivation, setMotivation] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  // validation
  const validateUsername = (v: string) => v.length >= 3;
  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const validatePassword = (v: string) => v.length >= 6;

  const inputBorderVariants: Variants = {
    default: { borderColor: "rgba(255,255,255,0.1)" },
    invalid: { borderColor: "#ef4444" },
    valid: { borderColor: "#22c55e" },
  };

  const getState = (key: keyof typeof touched, valid: boolean) =>
    touched[key] ? (valid ? "valid" : "invalid") : "default";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    const usernameValid = validateUsername(username);
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    if (!usernameValid || !emailValid || !passwordValid) {
      setTouched({ username: true, email: true, password: true });
      setApiError("Please correct the errors before signing up.");
      return;
    }

    // Ensure basic dev info is provided
    if (!language || !experience || !focusArea) {
      setApiError("Please fill in all developer experience fields.");
      return;
    }

    setLoading(true);
    try {
      const developerInfo = {
        experienceLevel: experience,
        favoriteStack: language,
        challengesSolved: undefined,
        portfolio: undefined,
        github: github || undefined,
        linkedin: undefined,
        learningGoals: motivation || focusArea || undefined,
      };

      const responseData = await apiClient.signupTester(
        username,
        email,
        password,
        developerInfo
      );

      dispatch(
        setUser({
          id: responseData.user.id,
          username: responseData.user.username,
          email: responseData.user.email,
          totalPoints: responseData.user.totalPoints,
          token: responseData.token,
        })
      );
      toast.success("Welcome, Beta Tester! 🎉");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "An unexpected error occurred. Please try again.";
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f1c2e] via-[#1e3a5f] to-[#0f1c2e] p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl p-8 rounded-xl shadow-2xl bg-[#1a2338]/80 border border-white/10"
      >
        <h1 className="text-4xl font-extrabold text-center text-[#06ffa5] mb-6 font-mono">
          Join the Beta Program 🧪
        </h1>
        <p className="text-center text-white/60 text-sm mb-6">
          Help shape the future of our platform by sharing your developer
          experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 p-4 text-center text-sm font-semibold text-red-100 bg-red-600/20 border border-red-500 rounded-lg"
            >
              <AlertCircle className="text-red-400" size={18} />
              <span>{apiError}</span>
            </motion.div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f1c2e] border text-white focus:outline-none transition duration-200"
                placeholder="Choose a username"
                variants={inputBorderVariants}
                animate={getState("username", validateUsername(username))}
                initial={false}
              />
              {touched.username &&
                (validateUsername(username) ? (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f1c2e] border text-white focus:outline-none transition duration-200"
                placeholder="Enter your email"
                variants={inputBorderVariants}
                animate={getState("email", validateEmail(email))}
                initial={false}
              />
            </div>
          </div>

          {/* --- Developer Info Section --- */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Code size={18} className="text-[#06ffa5]" /> Developer
              Information
            </h2>

            {/* Language */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Primary Programming Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#0f1c2e] border border-white/10 text-white rounded-lg py-3 px-3 focus:outline-none"
                >
                  <option value="">Select a language</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Go">Go</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Years of Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-[#0f1c2e] border border-white/10 text-white rounded-lg py-3 px-3 focus:outline-none"
                >
                  <option value="">Select experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Focus Area */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Main Development Area
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-[#0f1c2e] border border-white/10 text-white rounded-lg py-3 px-3 focus:outline-none"
              >
                <option value="">Select area</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Fullstack</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
                <option value="AI/ML">AI / Machine Learning</option>
              </select>
            </div>

            {/* GitHub */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                <Github size={16} /> GitHub Profile (optional)
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-[#0f1c2e] border border-white/10 text-white rounded-lg py-3 px-3 focus:outline-none"
                placeholder="https://github.com/yourusername"
              />
            </div>

            {/* Motivation */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                <FileText size={16} /> Why do you want to join the beta?
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full bg-[#0f1c2e] border border-white/10 text-white rounded-lg py-3 px-3 focus:outline-none"
                rows={3}
                placeholder="Tell us briefly what excites you about testing this app..."
              />
            </div>
          </div>

          {/* Password */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <motion.input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f1c2e] border text-white focus:outline-none transition duration-200"
                placeholder="Create a password"
                variants={inputBorderVariants}
                animate={getState("password", validatePassword(password))}
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
          </div>

          {/* Access Code */}
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Beta Access Code (optional)
            </label>
            <div className="relative">
              <FlaskConical
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f1c2e] border border-white/10 text-white focus:outline-none transition duration-200"
                placeholder="Enter access code if you have one"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#25a96d] text-[#0f1c2e] font-bold py-3 rounded-lg hover:from-[#25a96d] hover:to-[#06ffa5] transition-all duration-300 shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} /> Joining...
              </>
            ) : (
              <>
                <FlaskConical className="mr-2" size={18} /> Join Beta
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">
            Already joined?{" "}
            <Link href="/Login" className="text-[#06ffa5] hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BetaSignup;
