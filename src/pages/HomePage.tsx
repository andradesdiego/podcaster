import { useNavigate } from "react-router-dom";
import { PodcastCard } from "../components/PodcastCard";
import { SearchInput } from "../components/SearchInput";
import { usePodcast } from "../context/PodcastContext";
import { PodcastListDTO } from "../application/dto/PodcastDTO";
import { Container } from "../infrastructure/di/Container";
import "./HomePage.css";
import { useState, useMemo } from "react";

export function HomePage() {
  const navigate = useNavigate();
  const { podcasts, loading, error } = usePodcast();
  const [searchTerm, setSearchTerm] = useState("");

  // Use DDD service for filtering
  const filteredPodcasts = useMemo(() => {
    if (!searchTerm.trim()) return podcasts;

    const container = Container.getInstance();
    const podcastService = container.getPodcastService();
    return podcastService.filterPodcasts(podcasts, searchTerm);
  }, [podcasts, searchTerm]);

  const resultsCount = filteredPodcasts.length;

  const handlePodcastClick = (podcastId: string) => {
    navigate(`/podcast/${podcastId}`);
  };

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
        {filteredPodcasts.map((podcast: PodcastListDTO) => (
          <PodcastCard
            key={podcast.id}
            imageUrl={podcast.image}
            title={podcast.title.toUpperCase()}
            author={podcast.author}
            onClick={() => handlePodcastClick(podcast.id)}
          />
        ))}
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
