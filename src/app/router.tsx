import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../ui/pages/HomePage';
import { PodcastDetail } from '../ui/pages/PodcastDetail';
import { EpisodeDetail } from '../ui/pages/EpisodeDetail';
import { ErrorPage } from '../ui/pages/ErrorPage';
import { NotFoundPage } from '../ui/pages/NotFoundPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/podcast/:id" element={<PodcastDetail />} />
      <Route
        path="/podcast/:podcastId/episode/:episodeId"
        element={<EpisodeDetail />}
      />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
