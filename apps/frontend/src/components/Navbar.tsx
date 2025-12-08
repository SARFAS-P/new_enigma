import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Menu, X } from "lucide-react";
import Logo from "@/assets/Group 113.svg";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  isSignInPage?: boolean;
  className?: string;
}

const navItems = [
  { name: "Home", path: "/" },
  { name: "Rules", path: "/rules" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "About", path: "/about-us" },
  { name: "Play", path: "/play" },
];

export function Navbar({ isSignInPage = false, className }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isAboutUsPage = location.pathname === "/about-us";
  const isRulesPage = location.pathname === "/rules";
  const hasCustomScroll = isAboutUsPage || isRulesPage;

  useEffect(() => {
    lastScrollY.current = 0;
    setVisible(true);

    const getScrollElement = (): HTMLElement | null => {
      if (isAboutUsPage) {
        return document.querySelector('[data-about-us-scroll]') as HTMLElement;
      } else if (isRulesPage) {
        return document.querySelector('[data-rules-scroll]') as HTMLElement;
      }
      return null;
    };

    const handleScroll = () => {
      let current: number;

      if (hasCustomScroll) {
        const scrollElement = getScrollElement();
        if (!scrollElement) return;
        current = scrollElement.scrollTop;
      } else {
        current = window.scrollY;
      }

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (current <= 0) {
            setVisible(true);
          } else if (current > lastScrollY.current && current > 50) {
            setVisible(false);
          } else if (current < lastScrollY.current) {
            setVisible(true);
          }
          lastScrollY.current = current;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    if (hasCustomScroll) {
      let scrollElement: HTMLElement | null = null;
      let timeoutIds: NodeJS.Timeout[] = [];
      let observer: MutationObserver | null = null;

      const setupScrollListener = () => {
        const element = getScrollElement();
        if (element && !scrollElement) {
          scrollElement = element;
          scrollElement.addEventListener("scroll", handleScroll, { passive: true });
          handleScroll();
          return true;
        }
        return false;
      };

      if (!setupScrollListener()) {
        for (let i = 0; i < 5; i++) {
          const timeoutId = setTimeout(() => {
            setupScrollListener();
          }, 50 * (i + 1));
          timeoutIds.push(timeoutId);
        }

        observer = new MutationObserver(() => {
          if (setupScrollListener() && observer) {
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }

      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
        if (observer) observer.disconnect();
        if (scrollElement) {
          scrollElement.removeEventListener("scroll", handleScroll);
        }
      };
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [hasCustomScroll, isAboutUsPage, isRulesPage]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to sign out", error);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-black transition-transform duration-300",
        hasCustomScroll ? "bg-[var(--page-bg,#f6efe6)]" : "bg-transparent",
        visible ? "translate-y-0" : "-translate-y-full",
        className
      )}
    >
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" aria-label="Enigma home" className="flex items-center justify-start">
            <img
              src={Logo}
              alt="Enigma logo"
              className="h- sm:h-8 md:h-9 w-auto object-contain select-none -ml-12"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-10">
            <nav className="flex items-center space-x-10">
              {navItems.map((item) => {
                let path = item.path;
                if (item.name === "Play") {
                  path = currentUser ? "/levels" : "/play";
                }
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={item.name}
                    to={path}
                    className={cn(
                      "text-sm tracking-wide transition-colors relative group",
                      "font-semibold",
                      isActive ? "text-black font-bold" : "text-black/60 hover:text-black"
                    )}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full" />
                  </Link>
                );
              })}
            </nav>

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center" aria-label="Open account menu">
                    <Avatar className="h-9 w-9 border border-black/10">
                      <AvatarImage src={currentUser.photoURL ?? undefined} />
                      <AvatarFallback className="bg-black text-white">
                        {currentUser.displayName?.[0]?.toUpperCase() ||
                          currentUser.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 bg-white border border-black/10">
                  <DropdownMenuItem className="text-black" aria-disabled>
                    {currentUser.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isSignInPage ? (
              <Link
                to="/signin"
                className="text-sm font-medium rounded-md border border-black text-black px-4 py-1.5 hover:bg-black hover:text-white transition"
              >
                SIGN UP
              </Link>
            ) : null}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="p-2"
            >
              {open ? <X className="h-6 w-6 text-black" /> : <Menu className="h-6 w-6 text-black" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "fixed inset-y-0 left-0 w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto pt-6",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal={open}
        >
          <div className="flex items-center justify-between p-4 border-b border-black/10">
            <div className="flex items-center space-x-2">
              <img src={Logo} alt="Enigma logo" className="h-6 w-auto object-contain" />
              <span className="font-semibold text-lg text-black">Enigma</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
              <X className="h-6 w-6 text-black" />
            </button>
          </div>

          <nav className="flex flex-col mt-2">
            {navItems.map((item) => {
              let path = item.path;
              if (item.name === "Play") {
                path = currentUser ? "/levels" : "/play";
              }
              return (
                <Link
                  key={item.name}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="px-6 py-4 text-black font-medium flex justify-between items-center border-b border-black/10 hover:bg-black hover:text-white transition-colors"
                >
                  {item.name}
                  <span className="text-black/40">›</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {open && (
          <button
            type="button"
            aria-label="Close mobile menu"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    </header>
  );
}