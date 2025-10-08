import {
  Code,
  Users,
  Trophy,
  Zap,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { clearUser } from "../store/userSlice";

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
    { icon: Code, label: "Challenges", href: "/challenges" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    {
      icon: UserIcon,
      label: "Profile",
      href: profileHref,
    },
  ];

  const staticLinkClasses =
    "flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200";

  const handleLogout = () => {
    dispatch(clearUser());
    router.replace("/Login");
  };

  return (
    <div
      className="w-64 h-screen border-r border-white/10 fixed left-0 top-0"
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
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            if (!hasMounted && item.label === "Profile") {
              return (
                <li key={index}>
                  <a href="/Login" className={staticLinkClasses}>
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </li>
              );
            }

            return (
              <li key={index}>
                <a href={item.href} className={staticLinkClasses}>
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            );
          })}
          {/* 💡 NEW: Display User's Total Points */}
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
          {/* Logout Button */}
          {hasMounted && user?.id && (
            <li>
              <button
                onClick={handleLogout}
                className={`${staticLinkClasses} w-full text-left focus:outline-none`}
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
