import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePodcast } from '../context/PodcastContext';
import { PodcastSidebar } from '../components/PodcastSidebar';
import { PodcastListDTO, EpisodeDTO } from '../../application/dto/PodcastDTO';
import './PodcastDetail.css';

export function PodcastDetail() {
  const { id } = useParams<{ id: string }>();
  const { podcasts, loading, error, episodes, loadEpisodes } = usePodcast();
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

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
            err instanceof Error ? err.message : 'Failed to load episodes'
          );
          setEpisodesLoading(false);
        });
    }
  }, [id, loadEpisodes, episodes]);

  const formatDuration = (duration?: number): string => {
    if (!duration) return '-';

    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

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

  const podcast = podcasts.find((p: PodcastListDTO) => p.id === id);

  if (!podcast) {
    return (
      <div className="podcast-detail-not-found">
        <p>Podcast not found</p>
      </div>
    );
  }

  // Get episodes from new Context structure
  const podcastEpisodes = episodes[id || ''] || [];

  return (
    <div className="podcast-detail">
      <PodcastSidebar podcast={podcast} />
      <div className="podcast-detail__main">
        <div className="podcast-detail__episodes-header">
          <h2>Episodes ({podcastEpisodes.length})</h2>
        </div>

        {episodesLoading && (
          <div className="podcast-detail__episodes-loading">
            <p>Loading episodes...</p>
          </div>
        )}

        {episodesError && (
          <div className="podcast-detail__episodes-error">
            <p>Error loading episodes: {episodesError}</p>
          </div>
        )}

        {!episodesLoading && !episodesError && podcastEpisodes.length > 0 && (
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
                {podcastEpisodes.map((episode: EpisodeDTO) => (
                  <tr key={episode.id} className="episode-row">
                    <td className="episode-title">
                      <Link
                        to={`/podcast/${id}/episode/${episode.id}`}
                        className="episode-title-link"
                      >
                        {episode.title}
                      </Link>
                    </td>
                    <td className="episode-date">
                      {formatDate(episode.publishedAt)}
                    </td>
                    <td className="episode-duration">
                      {formatDuration(episode.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!episodesLoading && !episodesError && podcastEpisodes.length === 0 && (
          <div className="podcast-detail__no-episodes">
            <p>No episodes found for this podcast</p>
          </div>
        )}
      </div>
    </div>
  );
}
