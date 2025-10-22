// pages/settings/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/router";
import { apiClient, UserInfo } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { clearUser, setUser } from "@/store/userSlice";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user); // Get current logged-in user

  // Account Settings States
  const [username, setUsername] = useState(currentUser.username || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Editor Settings States (Client-side, saved to localStorage)
  const [editorFontSize, setEditorFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editorFontSize") || "14";
    }
    return "14";
  });
  const [editorTheme, setEditorTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editorTheme") || "dracula";
    }
    return "dracula";
  });
  const [editorTabSize, setEditorTabSize] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editorTabSize") || "2";
    }
    return "2";
  });
  const [isEditorSaving, setIsEditorSaving] = useState(false);

  // Update local states when Redux user data changes
  useEffect(() => {
    setUsername(currentUser.username || "");
    setEmail(currentUser.email || "");
  }, [currentUser.username, currentUser.email]);

  // Handle Account Profile Update
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsAccountSaving(true);
    if (!currentUser.id) {
      toast.error("User not logged in.");
      setIsAccountSaving(false);
      return;
    }

    try {
      const updateData: { username?: string; email?: string } = {};
      if (username !== currentUser.username) updateData.username = username;
      if (email !== currentUser.email) updateData.email = email;

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save.");
        setIsAccountSaving(false);
        return;
      }

      const response = await apiClient.updateUserProfile(
        currentUser.id,
        updateData
      );
      dispatch(
        setUser({
          ...currentUser,
          username: response.user.username,
          email: response.user.email,
        })
      );
      toast.success(response.message);
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsAccountSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setIsPasswordChanging(true);
    if (!currentUser.id) {
      toast.error("User not logged in.");
      setIsPasswordChanging(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      setIsPasswordChanging(false);
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      setIsPasswordChanging(false);
      return;
    }

    try {
      const response = await apiClient.updateUserPassword(currentUser.id, {
        currentPassword,
        newPassword,
      });
      toast.success(response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      console.error("Password change error:", err);
      toast.error(err.message || "Failed to change password.");
    } finally {
      setIsPasswordChanging(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!currentUser.id) {
      toast.error("User not logged in.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await apiClient.deleteUserAccount(currentUser.id);
      toast.success(response.message);
      dispatch(clearUser());
      router.replace("/Login");
    } catch (err: any) {
      console.error("Delete account error:", err);
      toast.error(err.message || "Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Handle Editor Settings Update (Client-side only)
  const handleEditorSettingsSave = (e: FormEvent) => {
    e.preventDefault();
    setIsEditorSaving(true);
    try {
      localStorage.setItem("editorFontSize", editorFontSize);
      localStorage.setItem("editorTheme", editorTheme);
      localStorage.setItem("editorTabSize", editorTabSize);
      toast.success("Editor preferences saved!");
    } catch (err: any) {
      console.error("Editor settings save error:", err);
      toast.error("Failed to save editor preferences.");
    } finally {
      setIsEditorSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="ml-64 p-8 text-white max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 border-b pb-4 border-white/10 font-mono text-[#06ffa5] text-center">
            Settings
          </h1>

          {/* Account Settings */}
          <div className="bg-[#1a1a2e]/80 p-8 rounded-xl shadow-2xl border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/5 pb-2">
              Profile Information
            </h2>{" "}
            {/* 💡 MODIFIED: Changed title */}
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#06ffa5] text-[#0f0f23] font-semibold rounded-lg hover:bg-[#04cc83] transition-colors duration-200"
                disabled={isAccountSaving}
              >
                {isAccountSaving ? "Saving..." : "Save Profile"}
              </button>
            </form>
            <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-white/5 pb-2">
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#4cc9f0] text-[#0f0f23] font-semibold rounded-lg hover:bg-[#38bdf8] transition-colors duration-200"
                disabled={isPasswordChanging}
              >
                {isPasswordChanging ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Editor Preferences */}
          <div className="bg-[#1a1a2e]/80 p-8 rounded-xl shadow-2xl border border-white/10 mb-8">
            {" "}
            {/* 💡 MODIFIED: Added mb-8 */}
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/5 pb-2">
              Editor Preferences
            </h2>
            <form onSubmit={handleEditorSettingsSave} className="space-y-6">
              <div>
                <label
                  htmlFor="editorFontSize"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Font Size
                </label>
                <select
                  id="editorFontSize"
                  value={editorFontSize}
                  onChange={(e) => setEditorFontSize(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="editorTheme"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Theme
                </label>
                <select
                  id="editorTheme"
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                >
                  <option value="dracula">Dracula</option>
                  <option value="monokai">Monokai</option>
                  <option value="github">GitHub</option>
                  <option value="tomorrow_night">Tomorrow Night</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="editorTabSize"
                  className="block text-white/70 text-sm font-semibold mb-2"
                >
                  Tab Size
                </label>
                <select
                  id="editorTabSize"
                  value={editorTabSize}
                  onChange={(e) => setEditorTabSize(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#06ffa5] text-[#0f0f23] font-semibold rounded-lg hover:bg-[#04cc83] transition-colors duration-200"
                disabled={isEditorSaving}
              >
                {isEditorSaving ? "Saving..." : "Save Editor Preferences"}
              </button>
            </form>
          </div>

          {/* Delete Account Button (Moved to the very bottom) */}
          <div className="bg-[#1a1a2e]/80 p-8 rounded-xl shadow-2xl border border-red-500/30">
            {" "}
            {/* 💡 NEW: Red border for delete section */}
            <h2 className="text-2xl font-bold text-red-500 mb-4 border-b border-red-500/50 pb-2">
              Danger Zone
            </h2>
            <p className="text-red-300 mb-6">
              Permanently delete your account and all associated data. This
              action is irreversible.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
