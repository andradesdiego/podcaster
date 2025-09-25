import { PodcastCard } from "../components/PodcastCard";
import { SearchInput } from "../components/SearchInput";
import { usePodcastFilter } from "../hooks/usePodcastFilter";
import { usePodcast } from "../context/PodcastContext";
import { PodcastEntry } from "../types/podcast";
import "./HomePage.css";

export function HomePage() {
  const { podcasts, loading, error } = usePodcast();

  const getImage = (pod: PodcastEntry): string => {
    const imgs = pod?.["im:image"] ?? [];
    const by170 = imgs.find((x) => x?.attributes?.height === "170");
    return by170?.label ?? imgs.at(-1)?.label ?? "";
  };

  const { filteredPodcasts, searchTerm, setSearchTerm, resultsCount } =
    usePodcastFilter(podcasts);

  if (loading) {
    return (
      <div className="homepage-loading">
        <p>Loading podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-error">
        <p>Error loading podcasts: {error}</p>
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
          const title = pod?.["im:name"]?.label ?? "";
          const author = pod?.["im:artist"]?.label ?? "";
          const img = getImage(pod);

          return (
            <PodcastCard
              key={id}
              imageUrl={img}
              title={title.toUpperCase()}
              author={author}
              onClick={() => {
                console.log(`Navigate to podcast ${id}`);
              }}
            />
          );
        })}
      </div>

      {!loading && resultsCount === 0 && searchTerm && (
        <div className="homepage-no-results">
          <p>No podcasts found for "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm("")}
            className="homepage-clear-search"
          >
            Show all podcasts
          </button>
        </div>
      )}
    </div>
  );
}
