import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePodcast } from "../context/PodcastContext";
import { PodcastSidebar } from "../components/PodcastSidebar";
import { PodcastListDTO, EpisodeDTO } from "../../application/dto/PodcastDTO";
import "./PodcastDetail.css";

const formatDuration = (duration?: number): string => {
  if (!duration) return "-";
  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export function PodcastDetail() {
  const { id } = useParams<{ id: string }>();
  const { podcasts, loading, error, episodes, loadEpisodes } = usePodcast();
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

  // Load episodes when component mounts or ID changes
  useEffect(() => {
    if (id && !episodes[id]) {
      setEpisodesLoading(true);
      setEpisodesError(null);

      loadEpisodes(id)
        .then(() => {
          setEpisodesLoading(false);
        })
        .catch((err) => {
          setEpisodesError(
            err instanceof Error ? err.message : "Failed to load episodes",
          );
          setEpisodesLoading(false);
        });
    }
  }, [id, loadEpisodes, episodes]);

  // Loading state for initial podcasts
  if (loading) {
    return (
      <div className="podcast-detail-loading">
        <p>Loading podcast...</p>
      </div>
    );
  }

  // Error state for initial podcasts
  if (error) {
    return (
      <div className="podcast-detail-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Find the podcast in the list
  const podcast = podcasts.find((p: PodcastListDTO) => p.id === id);

  // Podcast not found
  if (!podcast) {
    return (
      <div className="podcast-detail-not-found">
        <h2>Podcast Not Found</h2>
        <p>The podcast you're looking for doesn't exist.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  // Get episodes for current podcast
  const podcastEpisodes = episodes[id || ""] || [];

  return (
    <div className="podcast-detail">
      <PodcastSidebar podcast={podcast} />

      <div className="podcast-detail__main">
        <div className="episodes-section">
          <h2>Episodes ({podcastEpisodes.length})</h2>

          {/* Episodes Loading State */}
          {episodesLoading && (
            <div className="episodes-loading">
              <p>Loading episodes...</p>
            </div>
          )}

          {/* Episodes Error State */}
          {episodesError && (
            <div className="episodes-error">
              <p>Error loading episodes: {episodesError}</p>
              <button
                onClick={() => {
                  setEpisodesError(null);
                  if (id) loadEpisodes(id);
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Episodes Table */}
          {!episodesLoading && !episodesError && podcastEpisodes.length > 0 && (
            <table className="episodes-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {podcastEpisodes.map((episode: EpisodeDTO) => (
                  <tr key={episode.id}>
                    <td>
                      <Link
                        to={`/podcast/${id}/episode/${episode.id}`}
                        className="episode-link"
                      >
                        {episode.title}
                      </Link>
                    </td>
                    <td>{formatDate(episode.publishedAt)}</td>
                    <td>{formatDuration(episode.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* No Episodes State */}
          {!episodesLoading &&
            !episodesError &&
            podcastEpisodes.length === 0 && (
              <div className="no-episodes">
                <p>No episodes available for this podcast.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
