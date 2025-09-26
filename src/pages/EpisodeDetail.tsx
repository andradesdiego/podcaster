import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { usePodcast } from "../context/PodcastContext";
import { PodcastEntry, Episode } from "../types/podcast";
import "./EpisodeDetail.css";

export function EpisodeDetail() {
  const { podcastId, episodeId } = useParams<{
    podcastId: string;
    episodeId: string;
  }>();
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
    if (podcastId) {
      fetchEpisodes(podcastId);
    }
  }, [podcastId, fetchEpisodes]);

  if (loading) {
    return (
      <div className="episode-detail-loading">
        <p>Loading podcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="episode-detail-error">
        <p>Error loading podcast: {error}</p>
      </div>
    );
  }

  const podcast = podcasts.find(
    (p: PodcastEntry) => p?.id?.attributes?.["im:id"] === podcastId
  );

  if (!podcast) {
    return (
      <div className="episode-detail-not-found">
        <p>Podcast not found</p>
      </div>
    );
  }

  const podcastEpisodes = episodes[podcastId || ""] || [];
  const isLoadingEpisodes = episodesLoading[podcastId || ""] || false;
  const episodeError = episodesError[podcastId || ""];

  const episode = podcastEpisodes.find(
    (ep: Episode) => ep.trackId.toString() === episodeId
  );

  if (isLoadingEpisodes) {
    return (
      <div className="episode-detail-loading">
        <p>Loading episode...</p>
      </div>
    );
  }

  if (episodeError) {
    return (
      <div className="episode-detail-error">
        <p>Error loading episode: {episodeError}</p>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="episode-detail-not-found">
        <p>Not found episode</p>
      </div>
    );
  }

  const getImage = (pod: PodcastEntry): string => {
    const imgs = pod?.["im:image"] ?? [];
    const by600 = imgs.find((x) => x?.attributes?.height === "600");
    const by170 = imgs.find((x) => x?.attributes?.height === "170");
    return by600?.label || by170?.label || imgs.at(-1)?.label || "";
  };

  const title = podcast?.["im:name"]?.label || "";
  const author = podcast?.["im:artist"]?.label || "";
  const image = getImage(podcast);

  const createMarkup = (htmlString: string) => {
    return { __html: htmlString };
  };

  const hasAudioUrl = episode.episodeUrl && episode.episodeUrl.trim() !== "";

  return (
    <div className="episode-detail">
      <div className="episode-detail__sidebar">
        <div className="episode-detail__image-container">
          <Link to={`/podcast/${podcastId}`}>
            <img
              src={image}
              alt={`${title} podcast cover`}
              className="episode-detail__image"
            />
          </Link>
        </div>
        <div className="episode-detail__info">
          <Link
            to={`/podcast/${podcastId}`}
            className="episode-detail__title-link"
          >
            <h1 className="episode-detail__title">{title}</h1>
          </Link>
          <Link
            to={`/podcast/${podcastId}`}
            className="episode-detail__author-link"
          >
            <p className="episode-detail__author">by {author}</p>
          </Link>
          <div className="episode-detail__description">
            <p>Description: {title}</p>
          </div>
        </div>
      </div>

      <div className="episode-detail__main">
        <div className="episode-detail__content">
          <h2 className="episode-detail__episode-title">{episode.trackName}</h2>

          {episode.description && (
            <div
              className="episode-detail__episode-description"
              dangerouslySetInnerHTML={createMarkup(episode.description)}
            />
          )}

          {hasAudioUrl ? (
            <div className="episode-detail__player">
              <audio controls preload="none" className="episode-detail__audio">
                <source src={episode.episodeUrl} type="audio/mpeg" />
                <source src={episode.episodeUrl} type="audio/mp4" />
                Your browser does not support audio.
              </audio>
            </div>
          ) : (
            <div className="episode-detail__no-audio">
              <p>Audio not available for this episode</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
