import { useEffect, useState } from "react";

type podcast = {
  "im:name": string;
};

function App() {
  const [data, setData] = useState<podcast[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/rss/toppodcasts/limit=100/genre=1310/json")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setData(json.feed.entry);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Podcast Player</h1>
      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
      {!loading && !error && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "#3c3d3dff",
            padding: 16,
          }}
        >
          {data && (
            <ul>
              {data.map((pod: any) => (
                <li key={pod.id.attributes["im:id"]}>
                  <strong>{pod["im:name"].label}</strong> —{" "}
                  {pod["im:artist"].label}
                </li>
              ))}
            </ul>
          )}
        </pre>
      )}
    </main>
  );
}

export default App;
