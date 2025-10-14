import {
  Code,
  Users,
  Trophy,
  Zap,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { clearUser } from "../store/userSlice";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

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
    dispatch(clearUser());
    router.replace("/Login");
  };

  return (
    <div
      className="w-64 h-screen border-r border-white/10 fixed left-0 top-0 bg-[#0a0a0a]"
      suppressHydrationWarning={true}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-[#06ffa5]" />
          <span className="text-xl font-bold gradient-text font-mono">
            Reactivate
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6">
        <ul className="space-y-2 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;

            return (
              <li key={index} className="relative">
                {/* Animated glowing background */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 rounded-lg bg-[#06ffa5]/10 border border-[#06ffa5]/40"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </AnimatePresence>

                <a
                  href={item.href}
                  className={`${staticLinkClasses} ${
                    isActive ? "text-[#06ffa5]" : ""
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium relative z-10">
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}

          {/* 💡 Display User Points */}
          {hasMounted && user?.id && (
            <li className="pt-4 border-t border-white/10 mt-4">
              <div className="flex items-center space-x-3 px-4 py-3 text-white/80">
                <Trophy size={20} className="text-yellow-400" />
                <span className="font-medium">Points:</span>
                <span className="font-bold text-yellow-300">
                  {user.totalPoints}
                </span>
              </div>
            </li>
          )}

          {/* Logout */}
          {hasMounted && user?.id && (
            <li>
              <button
                onClick={handleLogout}
                className={`${staticLinkClasses} w-full text-left focus:outline-none`}
              >
                <LogOut size={20} />
                <span className="font-medium relative z-10">Logout</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
