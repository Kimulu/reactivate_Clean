// components/Sidebar.tsx
import { Code, Users, Trophy, Zap, User as UserIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export function Sidebar() {
  const user = useSelector((state: RootState) => state.user);

  const navItems = [
    { icon: Code, label: "Challenges", href: "/challenges" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    // ✅ Dynamically set profile link
    {
      icon: UserIcon,
      label: "Profile",
      href: user?.id ? `/profile/${user.id}` : "/Login",
    },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-[#1a1a2e] to-[#0f0f23] border-r border-white/10 fixed left-0 top-0">
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
            return (
              <li key={index}>
                <a
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
