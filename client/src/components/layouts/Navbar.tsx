import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import useIsMobile from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  return (
    <header className="w-full max-w-full overflow-x-hidden">
      <nav className="w-full flex items-center justify-between px-4 py-4 border-b border-border/60 bg-background">
        {/* Left: Menu + Brand */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              aria-label="Open menu"
              onClick={() => setIsMenuOpened((v) => !v)}
              className="
                p-2 rounded-md bg-card
                cursor-pointer
                transition
                hover:bg-muted
                active:scale-95
                focus:outline-none
                focus:ring-2 focus:ring-primary/50
              "
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Brand (consistent across breakpoints) */}
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <img
              src="/icons/happr-icon.jpg"
              width={32}
              height={32}
              className="rounded-full"
              alt="Happr Logo"
            />
            <h1 className="text-primary text-2xl font-semibold tracking-tight">
              Happr
            </h1>
          </div>
        </div>

        {/* Right: Avatar (interactive) */}
        <button
          aria-label="Open profile menu"
          className="
            rounded-full
            cursor-pointer
            transition
            hover:scale-105
            active:scale-95
            focus:outline-none
            focus:ring-2 focus:ring-primary/50
          "
        >
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.username}&background=random&bold=true&size=128.png`
            }
            alt="User avatar"
            loading="eager"
            className="w-10 h-10 object-cover border border-border rounded-full bg-card"
          />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      {isMobile && isMenuOpened && (
        <Sidebar setIsMenuOpened={setIsMenuOpened} />
      )}
    </header>
  );
};

export default Navbar;
