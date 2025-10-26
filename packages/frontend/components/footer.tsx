import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 px-6 bg-black border-t border-white/10 text-center z-10">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white/70 font-saira text-sm z-10">
        <span className="flex items-center gap-2">
          Built with
          <Heart className="w-4 h-4 text-[#f72585] animate-pulse" />
          by
          <a
            href="https://www.linkedin.com/in/michael-kimulu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4cc9f0] hover:text-[#06ffa5] transition-colors font-medium"
          >
            Michael Kimulu
          </a>
        </span>
      </div>
    </footer>
  );
}
