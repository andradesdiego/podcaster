import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { usePodcast } from "../context/PodcastContext";
import { PodcastSidebar } from "../components/PodcastSidebar";
import { PodcastListDTO, EpisodeDTO } from "../application/dto/PodcastDTO";

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
    episodesLoading,
    episodesError,
    fetchEpisodes,
    getEpisodes,
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

  const podcast = podcasts.find((p: PodcastListDTO) => p.id === podcastId);

  if (!podcast) {
    return (
      <div className="episode-detail-not-found">
        <p>Podcast not found</p>
      </div>
    );
  }

  // Use new DDD Context API
  const podcastEpisodes = getEpisodes(podcastId || "");
  const isLoadingEpisodes = episodesLoading[podcastId || ""] || false;
  const episodeError = episodesError[podcastId || ""];

  const episode = podcastEpisodes.find((ep: EpisodeDTO) => ep.id === episodeId);

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
        <p>Episode not found</p>
      </div>
    );
  }

  const createMarkup = (htmlString: string) => {
    return { __html: htmlString };
  };

  const hasAudioUrl = episode.audioUrl && episode.audioUrl.trim() !== "";

  return (
    <div className="episode-detail">
      <PodcastSidebar podcast={podcast} linkTo={`/podcast/${podcastId}`} />
      <div className="episode-detail__main">
        <div className="episode-detail__content">
          <h2 className="episode-detail__episode-title">{episode.title}</h2>

          {episode.description && (
            <div
              className="episode-detail__episode-description"
              dangerouslySetInnerHTML={createMarkup(episode.description)}
            />
          )}

          {hasAudioUrl ? (
            <div className="episode-detail__player">
              <audio controls preload="none" className="episode-detail__audio">
                <source src={episode.audioUrl} type="audio/mpeg" />
                <source src={episode.audioUrl} type="audio/mp4" />
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
