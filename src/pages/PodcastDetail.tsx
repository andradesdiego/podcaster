import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { usePodcast } from "../context/PodcastContext";
import { PodcastEntry, Episode } from "../types/podcast";
import "./PodcastDetail.css";

export function PodcastDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    podcasts,
    loading,
    error,
    episodes,
    episodesLoading,
    episodesError,
    fetchEpisodes,
  } = usePodcast();

  useEffect(() => {
    if (id && fetchEpisodes) {
      fetchEpisodes(id);
    }
  }, [id, fetchEpisodes]);

  if (loading) {
    return (
      <div className="podcast-detail-loading">
        <p>Loading podcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="podcast-detail-error">
        <p>Error loading podcast: {error}</p>
      </div>
    );
  }

  const podcast = podcasts.find(
    (p: PodcastEntry) => p?.id?.attributes?.["im:id"] === id
  );

  if (!podcast) {
    return (
      <div className="podcast-detail-not-found">
        <p>Podcast not found</p>
      </div>
    );
  }

  const getImage = (pod: PodcastEntry): string => {
    const imgs = pod?.["im:image"] ?? [];
    const by600 = imgs.find((x) => x?.attributes?.height === "600");
    const by170 = imgs.find((x) => x?.attributes?.height === "170");
    return by600?.label || by170?.label || imgs.at(-1)?.label || "";
  };

  const formatDuration = (timeMillis?: number): string => {
    if (!timeMillis) return "-";

    const totalSeconds = Math.floor(timeMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const title = podcast?.["im:name"]?.label || "";
  const author = podcast?.["im:artist"]?.label || "";
  const image = getImage(podcast);

  const podcastEpisodes = episodes[id || ""] || [];
  const isLoadingEpisodes = episodesLoading[id || ""] || false;
  const episodeError = episodesError[id || ""];

  return (
    <div className="podcast-detail">
      <div className="podcast-detail__sidebar">
        <div className="podcast-detail__image-container">
          <img
            src={image}
            alt={`${title} podcast cover`}
            className="podcast-detail__image"
          />
        </div>
        <div className="podcast-detail__info">
          <div className="podcast-detail__title-link">
            <h1 className="podcast-detail__title">{title}</h1>
          </div>
          <div className="podcast-detail__author-link">
            <p className="podcast-detail__author">by {author}</p>
          </div>
          <div className="podcast-detail__description">
            <h3 className="podcast-detail__description-title">Description:</h3>
            <p> {title}</p>
          </div>
        </div>
      </div>

      <div className="podcast-detail__main">
        <div className="podcast-detail__episodes-header">
          <h2>Episodes ({podcastEpisodes.length})</h2>
        </div>

        {isLoadingEpisodes && (
          <div className="podcast-detail__episodes-loading">
            <p>Loading episodes...</p>
          </div>
        )}

        {episodeError && (
          <div className="podcast-detail__episodes-error">
            <p>Error loading episodes: {episodeError}</p>
          </div>
        )}

        {!isLoadingEpisodes && !episodeError && podcastEpisodes.length > 0 && (
          <div className="podcast-detail__episodes">
            <table className="episodes-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {podcastEpisodes.map((episode: Episode) => (
                  <tr key={episode.trackId} className="episode-row">
                    <td className="episode-title">
                      <Link
                        to={`/podcast/${id}/episode/${episode.trackId}`}
                        className="episode-title-link"
                      >
                        {episode.trackName}
                      </Link>
                    </td>
                    <td className="episode-date">
                      {formatDate(episode.releaseDate)}
                    </td>
                    <td className="episode-duration">
                      {formatDuration(episode.trackTimeMillis)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoadingEpisodes &&
          !episodeError &&
          podcastEpisodes.length === 0 && (
            <div className="podcast-detail__no-episodes">
              <p>No episodes found for this podcast</p>
            </div>
          )}
      </div>
    </div>
  );
}
