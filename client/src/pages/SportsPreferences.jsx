import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const ALL_SPORTS = ["football", "basketball", "cricket", "tennis"];

export default function SportsPreferences() {
  const { getToken } = useAuth();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await fetch("/subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data.sports || []);
      setLoading(false);
    }
    load();
  }, [getToken]);

  function toggle(sport) {
    setSelected((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function save() {
    const token = await getToken();
    await fetch("/subscriptions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sports: selected }),
    });
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your sports</h2>
      {ALL_SPORTS.map((sport) => (
        <label key={sport} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selected.includes(sport)}
            onChange={() => toggle(sport)}
          />
          {sport}
        </label>
      ))}
      <button onClick={save}>Save</button>
    </div>
  );
}