"use client";

import {
  Code,
  Users,
  Trophy,
  Zap,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Settings,
  Menu, // Hamburger icon
  X, // Close icon
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store"; // Make sure this path is correct
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Using next/navigation is robust
import { clearUser } from "@/store/userSlice"; // Make sure this path is correct
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/**
 * @description Renders the sidebar's navigation links and user info.
 * This is reused in both the desktop sidebar and the mobile drawer to prevent code duplication.
 */
const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const userIdForLink = hasMounted ? user?.id : null;
  const profileHref = userIdForLink ? `/profile/${userIdForLink}` : "/Login";

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Code, label: "Challenges", href: "/challenges" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: UserIcon, label: "Profile", href: profileHref },
  ];

  const staticLinkClasses =
    "relative flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white transition-all duration-300";

  const handleLogout = () => {
    if (onLinkClick) onLinkClick();
    dispatch(clearUser());
    router.replace("/");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-[#06ffa5]" />
          <span className="text-xl font-chicle gradient-text font-mono">
            Reactivate
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-6">
        <ul className="space-y-2 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href.startsWith("/profile") &&
                pathname.startsWith("/profile"));

            return (
              <li key={index} className="relative">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-[#06ffa5]/10 border border-[#06ffa5]/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`${staticLinkClasses} ${
                    isActive ? "text-[#06ffa5]" : ""
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-saira relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      {hasMounted && user?.id && (
        <div className="p-6 border-t border-white/10 mt-auto">
          <div className="flex items-center space-x-3 px-4 py-3 text-white/80 mb-2">
            <Trophy size={20} className="text-yellow-400" />
            <span className="font-saira">Points:</span>
            <span className="font-saira text-yellow-300">
              {user.totalPoints}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className={`${staticLinkClasses} w-full text-left focus:outline-none`}
          >
            <LogOut size={20} />
            <span className="font-saira relative z-10">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

const SidebarContentMobile = ({
  onLinkClick,
}: {
  onLinkClick?: () => void;
}) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const userIdForLink = hasMounted ? user?.id : null;
  const profileHref = userIdForLink ? `/profile/${userIdForLink}` : "/Login";

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Code, label: "Challenges", href: "/challenges" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: UserIcon, label: "Profile", href: profileHref },
  ];

  const staticLinkClasses =
    "relative flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white transition-all duration-300";

  const handleLogout = () => {
    if (onLinkClick) onLinkClick();
    dispatch(clearUser());
    router.replace("/");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* ✅ NEW: Header with Close Button */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 p-4 sm:p-6 h-[73px]">
        <button
          onClick={onLinkClick}
          className="absolute top-5 right-5 text-white/70 hover:text-[#4cc9f0] transition-colors"
        >
          <X className="w-7 h-7" />
        </button>
      </div>
      {/* Navigation Links */}
      <nav className="flex-grow overflow-y-auto p-6">
        <ul className="space-y-2 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href.startsWith("/profile") &&
                pathname.startsWith("/profile"));

            return (
              <li key={index} className="relative">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-[#06ffa5]/10 border border-[#06ffa5]/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`${staticLinkClasses} ${
                    isActive ? "text-[#06ffa5]" : ""
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-saira relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      {hasMounted && user?.id && (
        <div className="p-6 border-t border-white/10 mt-auto">
          <div className="flex items-center space-x-3 px-4 py-3 text-white/80 mb-2">
            <Trophy size={20} className="text-yellow-400" />
            <span className="font-saira">Points:</span>
            <span className="font-saira text-yellow-300">
              {user.totalPoints}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className={`${staticLinkClasses} w-full text-left focus:outline-none`}
          >
            <LogOut size={20} />
            <span className="font-saira relative z-10">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * @description A responsive component that acts as a top navbar on mobile
 * and a fixed-left sidebar on desktop.
 */
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* TOP NAVBAR (MOBILE ONLY) */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-[#06ffa5]" />
            <h1 className="text-lg gradient-text font-chicle">Reactivate</h1>
          </Link>
          <button onClick={() => setIsOpen(true)} className="text-white/90">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* FIXED SIDEBAR (DESKTOP ONLY) */}
      <div className="hidden md:block w-64 h-screen fixed left-0 top-0 border-r border-white/10 z-40">
        <SidebarContent />
      </div>

      {/* MOBILE DRAWER (SLIDES FROM RIGHT) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 right-0 h-screen w-64 z-50 md:hidden"
            >
              <SidebarContentMobile onLinkClick={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
