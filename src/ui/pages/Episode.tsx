import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePodcast } from "../context/PodcastContext";
import { PodcastSidebar } from "../components/PodcastSidebar";
import { PodcastListDTO, EpisodeDTO } from "../../application/dto/PodcastDTO";
import "./EpisodeDetail.css";

export function EpisodeDetail() {
  const { podcastId, episodeId } = useParams<{
    podcastId: string;
    episodeId: string;
  }>();
  const { podcasts, loading, error, episodes, loadEpisodes } = usePodcast();
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

  // Load episodes when component mounts or podcastId changes
  useEffect(() => {
    if (podcastId && !episodes[podcastId]) {
      setEpisodesLoading(true);
      setEpisodesError(null);

      loadEpisodes(podcastId)
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
  }, [podcastId, loadEpisodes, episodes]);

  // Loading state for initial podcasts
  if (loading) {
    return (
      <div className="episode-detail-loading">
        <p>Loading podcast...</p>
      </div>
    );
  }

  // Error state for initial podcasts
  if (error) {
    return (
      <div className="episode-detail-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Find the podcast in the list
  const podcast = podcasts.find((p: PodcastListDTO) => p.id === podcastId);

  // Podcast not found
  if (!podcast) {
    return (
      <div className="episode-detail-not-found">
        <h2>Podcast Not Found</h2>
        <p>The podcast you're looking for doesn't exist.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  // Episodes loading state
  if (episodesLoading) {
    return (
      <div className="episode-detail">
        <PodcastSidebar podcast={podcast} linkTo={`/podcast/${podcastId}`} />
        <div className="episode-detail__main">
          <div className="episode-loading">
            <p>Loading episode...</p>
          </div>
        </div>
      </div>
    );
  }

  // Episodes error state
  if (episodesError) {
    return (
      <div className="episode-detail">
        <PodcastSidebar podcast={podcast} linkTo={`/podcast/${podcastId}`} />
        <div className="episode-detail__main">
          <div className="episode-error">
            <h2>Error Loading Episode</h2>
            <p>Error: {episodesError}</p>
            <button
              onClick={() => {
                setEpisodesError(null);
                if (podcastId) loadEpisodes(podcastId);
              }}
            >
              Retry
            </button>
            <Link to={`/podcast/${podcastId}`}>← Back to Podcast</Link>
          </div>
        </div>
      </div>
    );
  }

  // Get episodes for current podcast
  const podcastEpisodes = episodes[podcastId || ""] || [];

  // Find the specific episode
  const episode = podcastEpisodes.find((ep: EpisodeDTO) => ep.id === episodeId);

  // Episode not found
  if (!episode) {
    return (
      <div className="episode-detail">
        <PodcastSidebar podcast={podcast} linkTo={`/podcast/${podcastId}`} />
        <div className="episode-detail__main">
          <div className="episode-not-found">
            <h2>Episode Not Found</h2>
            <p>
              The episode you're looking for doesn't exist or hasn't been loaded
              yet.
            </p>
            <div className="episode-not-found__actions">
              <Link to={`/podcast/${podcastId}`}>← Back to Podcast</Link>
              <button
                onClick={() => {
                  if (podcastId) loadEpisodes(podcastId);
                }}
              >
                Reload Episodes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="episode-detail">
      <PodcastSidebar podcast={podcast} linkTo={`/podcast/${podcastId}`} />

      <div className="episode-detail__main">
        <div className="episode-content">
          <div className="episode-header">
            <h1 className="episode-title">{episode.title}</h1>
            <Link to={`/podcast/${podcastId}`} className="back-to-podcast">
              ← Back to Podcast
            </Link>
          </div>

          {/* Episode Description */}
          {episode.description && (
            <div className="episode-description">
              <h3>Description</h3>
              <div
                className="episode-description__content"
                dangerouslySetInnerHTML={{ __html: episode.description }}
              />
            </div>
          )}

          {/* Audio Player */}
          <div className="episode-audio">
            <h3>Audio Player</h3>
            {episode.audioUrl ? (
              <audio
                controls
                preload="metadata"
                className="episode-audio__player"
                controlsList="nodownload"
              >
                <source src={episode.audioUrl} type="audio/mpeg" />
                <source src={episode.audioUrl} type="audio/mp4" />
                <source src={episode.audioUrl} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="episode-audio__not-available">
                <p>Audio not available for this episode</p>
                <small>
                  The audio file may not be accessible or may have been removed.
                </small>
              </div>
            )}
          </div>

          {/* Episode Metadata */}
          {(episode.publishedAt || episode.duration) && (
            <div className="episode-metadata">
              <h3>Episode Details</h3>
              <dl className="episode-metadata__list">
                {episode.publishedAt && (
                  <>
                    <dt>Published:</dt>
                    <dd>
                      {new Date(episode.publishedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </dd>
                  </>
                )}
                {episode.duration && (
                  <>
                    <dt>Duration:</dt>
                    <dd>{Math.floor(episode.duration / 60000)} minutes</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
