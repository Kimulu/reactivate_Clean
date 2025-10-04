import {
  Code,
  Users,
  Trophy,
  Zap,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux"; // Import useDispatch
import { RootState } from "../store";
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import useRouter
import { clearUser } from "../store/userSlice"; // 💡 Import clearUser action instead of logout

export function Sidebar() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  // State to track if the component has mounted on the client side
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Use the stored user ID if mounted, otherwise assume null for SSR consistency.
  // This helps prevent hydration errors if the profile link changes based on user ID.
  const userIdForLink = hasMounted ? user?.id : null;
  const profileHref = userIdForLink ? `/profile/${userIdForLink}` : "/Login"; // Changed to /Login for consistency

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

  // 💡 Function to handle logout using clearUser
  const handleLogout = () => {
    dispatch(clearUser()); // Dispatch the clearUser action
    router.replace("/Login"); // Redirect to the login page after logout
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

            // Conditional rendering for the Profile link to maintain SSR consistency
            if (!hasMounted && item.label === "Profile") {
              // During SSR/initial hydration, render the link with the server's expected default path (/Login)
              return (
                <li key={index}>
                  <a href="/Login" className={staticLinkClasses}>
                    {" "}
                    {/* Changed to /Login */}
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
          {/* 💡 Logout Button - now using clearUser */}
          {hasMounted &&
            user?.id && ( // Only show logout if mounted and user is logged in
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
