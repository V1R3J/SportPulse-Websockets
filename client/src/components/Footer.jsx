import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stadium-line bg-stadium-surface/60 mt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex rounded-full h-2 w-2 bg-lime-scoreboard" />
          <span className="font-display text-xl uppercase tracking-wide text-stadium-text">
            SportPulse
          </span>
          <span className="hidden sm:inline text-xs text-stadium-muted font-mono">
            Full-time whistle since {year}
          </span>
        </div>

        <nav className="flex items-center gap-5 text-sm text-stadium-muted">
          <Link to="/preferences" className="hover:text-lime-scoreboard transition-colors focus-visible:outline-2 focus-visible:outline-lime-scoreboard rounded">
            Manage sports
          </Link>
          <Link to="/profile" className="hover:text-lime-scoreboard transition-colors focus-visible:outline-2 focus-visible:outline-lime-scoreboard rounded">
            Profile
          </Link>
          <a href="mailto:support@sportpulse.app" className="hover:text-lime-scoreboard transition-colors focus-visible:outline-2 focus-visible:outline-lime-scoreboard rounded">
            Support
          </a>
        </nav>

        <p className="text-xs text-stadium-muted font-mono">
          &copy; {year} SportPulse &middot; Live scores, no added time.
        </p>
      </div>
    </footer>
  );
}