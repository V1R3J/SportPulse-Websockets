import { useEffect, useState } from "react";
import { useLiveScores } from "../hooks/useLiveScores";

const SPORT_COLORS = {
  football: "border-sport-football text-sport-football",
  basketball: "border-sport-basketball text-sport-basketball",
  cricket: "border-sport-cricket text-sport-cricket",
  tennis: "border-sport-tennis text-sport-tennis",
};

export default function Dashboard() {
  const liveEvents = useLiveScores();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/matches");
        if (!res.ok) throw new Error("Failed to load matches");
        const data = await res.json();
        setMatches(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stadium">


      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-8">
        {/* Matches */}
        <section>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-stadium-text mb-4">
            Matches
          </h2>

          {loading && <p className="text-stadium-muted">Loading matches...</p>}
          {error && <p className="text-amber-live">{error}</p>}
          {!loading && !error && matches.length === 0 && (
            <p className="text-stadium-muted">No matches yet.</p>
          )}

          <ul className="space-y-3">
            {matches.map((match) => {
              const sportClass =
                SPORT_COLORS[match.sport] || "border-stadium-line text-stadium-muted";
              return (
                <li
                  key={match.id}
                  className={`bg-stadium-surface border-l-4 ${sportClass} rounded-md px-4 py-3 flex items-center justify-between gap-3`}
                >
                  <div className="min-w-0">
                    <p className="text-stadium-text font-medium truncate">
                      {match.homeTeam}
                      <span className="text-stadium-muted mx-2">vs</span>
                      {match.awayTeam}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-stadium-muted mt-0.5">
                      {match.sport} &middot; {match.status}
                    </p>
                  </div>
                  <div className="font-mono text-base sm:text-lg tabular-nums bg-stadium/80 border border-stadium-line rounded px-2 py-1 text-stadium-text shrink-0">
                    {match.homeScore ?? "–"}&ndash;{match.awayScore ?? "–"}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Live commentary ticker */}
        <section>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-stadium-text mb-4">
            Live commentary
          </h2>

          <div className="bg-stadium-surface border border-stadium-line rounded-md divide-y divide-stadium-line max-h-[420px] lg:max-h-[560px] overflow-y-auto">
            {liveEvents.length === 0 && (
              <p className="text-stadium-muted px-4 py-6 text-sm">
                Waiting for updates on your subscribed sports.
              </p>
            )}
            {liveEvents.map((event, index) => (
              <div key={event.id ?? index} className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-stadium-muted mb-1">
                  <span className="font-mono tabular-nums text-lime-scoreboard">
                    {event.minute != null ? `${event.minute}'` : "—"}
                  </span>
                  <span>Match {event.matchId}</span>
                </div>
                <p className="text-stadium-text text-sm leading-snug">{event.message}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}