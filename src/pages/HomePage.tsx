import { useEffect, useState } from "react";
import { PodcastCard } from "../components/PodcastCard";
import { SearchInput } from "../components/SearchInput";
import { usePodcastFilter } from "../hooks/usePodcastFilter";
import { ApiResponse, PodcastEntry } from "../types/podcast";
import "./HomePage.css";

const TOP_URL = "/rss/toppodcasts/limit=100/genre=1310/json";

export function HomePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null); // Reset error state

    fetch(TOP_URL)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as ApiResponse;
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

  // helper pequeño para escoger la imagen 170px (o la última disponible)
  const getImage = (pod: PodcastEntry): string => {
    const imgs = pod?.["im:image"] ?? [];
    const by170 = imgs.find((x) => x?.attributes?.height === "170");
    return by170?.label ?? imgs.at(-1)?.label ?? "";
  };

  const entries = data?.feed?.entry ?? [];

  // Hook de filtrado
  const { filteredPodcasts, searchTerm, setSearchTerm, resultsCount } =
    usePodcastFilter(entries);

  if (loading) {
    return (
      <div className="homepage-loading">
        <p>Cargando podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-error">
        <p>Error al cargar los podcasts: {error}</p>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="homepage-header">
        <div className="homepage-results-count">{resultsCount}</div>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Filter podcasts..."
          disabled={loading}
        />
      </div>

      <div className="homepage-grid">
        {filteredPodcasts.map((pod: PodcastEntry) => {
          const id = pod?.id?.attributes?.["im:id"] ?? crypto.randomUUID();
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
      </div>

      {!loading && resultsCount === 0 && searchTerm && (
        <div className="homepage-no-results">
          <p>No se encontraron podcasts para "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm("")}
            className="homepage-clear-search"
          >
            Ver todos los podcasts
          </button>
        </div>
      )}
    </div>
  );
}
