import { useEffect, useState } from "react";
import { PodcastCard } from "./components/PodcastCard";
import "./App.css";

type TopFeed = any;
const TOP_URL = "/rss/toppodcasts/limit=100/genre=1310/json";

function App() {
  const [data, setData] = useState<TopFeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(TOP_URL)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setData(json);
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

  const getImage = (pod: any) => {
    const imgs = pod?.["im:image"] ?? [];
    const by170 = imgs.find((x: any) => x?.attributes?.height === "170");
    return by170?.label ?? imgs.at(-1)?.label ?? "";
  };

  const entries = data?.feed?.entry ?? [];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Podcaster</h1>
        {loading && <div className="loading-indicator">●</div>}
      </header>

      <main className="app-main">
        {error && <p className="error-message">Error: {error}</p>}

        {!loading && !error && Array.isArray(entries) && (
          <>
            <div className="results-count">{entries.length} podcasts</div>
            <ul className="podcast-grid">
              {entries.map((pod: any) => {
                const id =
                  pod?.id?.attributes?.["im:id"] ?? crypto.randomUUID();
                const title = pod?.["im:name"]?.label ?? "(sin título)";
                const author = pod?.["im:artist"]?.label ?? "(sin autor)";
                const img = getImage(pod);

                return (
                  <PodcastCard
                    key={id}
                    imageUrl={img}
                    title={title.toUpperCase()}
                    author={author}
                    onClick={() => {
                      // TODO: Navigate to podcast detail
                      console.log(`Navigate to podcast ${id}`);
                    }}
                  />
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
