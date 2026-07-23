import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("sportpulse-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("sportpulse-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const username =
    user?.username || user?.firstName || user?.fullName || "Player";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-stadium-line bg-stadium-surface/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-scoreboard opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-scoreboard" />
          </span>
          <span className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-stadium-text">
            SportPulse
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <Link
            to="/preferences"
            className="text-stadium-muted hover:text-lime-scoreboard transition-colors focus-visible:outline-2 focus-visible:outline-lime-scoreboard rounded"
          >
            Manage sports
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-stadium-line hover:border-lime-scoreboard transition-colors focus-visible:outline-2 focus-visible:outline-lime-scoreboard"
          >
            <Avatar user={user} initials={initials} className="h-7 w-7 text-xs" />
            <span className="text-stadium-text font-medium max-w-[10rem] truncate">
              {username}
            </span>
          </Link>

          <button
            onClick={() => signOut()}
            className="px-3 py-1.5 rounded-md border border-stadium-line text-stadium-muted hover:border-amber-live hover:text-amber-live transition-colors focus-visible:outline-2 focus-visible:outline-amber-live"
          >
            Sign out
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md border border-stadium-line text-stadium-text focus-visible:outline-2 focus-visible:outline-lime-scoreboard"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stadium-line bg-stadium-surface px-4 py-4 space-y-4">
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 py-1"
          >
            <Avatar user={user} initials={initials} className="h-9 w-9 text-sm" />
            <span className="text-stadium-text font-medium truncate">
              {username}
            </span>
          </Link>

          <Link
            to="/preferences"
            onClick={() => setMenuOpen(false)}
            className="block text-stadium-muted hover:text-lime-scoreboard transition-colors"
          >
            Manage sports
          </Link>

          <div className="flex items-center justify-between pt-3 border-t border-stadium-line">
            <span className="text-sm text-stadium-muted">Display</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2 rounded-md border border-stadium-line text-stadium-muted hover:border-amber-live hover:text-amber-live transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}

function Avatar({ user, initials, className }) {
  if (user?.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt=""
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <span
      className={`${className} rounded-full bg-stadium-line flex items-center justify-center font-semibold text-stadium-text shrink-0`}
    >
      {initials}
    </span>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to day match mode" : "Switch to night match mode"}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-stadium-line bg-stadium transition-colors focus-visible:outline-2 focus-visible:outline-lime-scoreboard"
    >
      <span
        className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-lime-scoreboard text-[10px] leading-none transition-transform ${
          isDark ? "translate-x-8" : "translate-x-1"
        }`}
      >
        {isDark ? "🌙" : "☀"}
      </span>
    </button>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}