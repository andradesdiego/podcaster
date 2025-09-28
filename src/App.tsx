import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./ui/components/Layout";
import { HomePage } from "./ui/pages/Home";
import { PodcastDetail } from "./ui/pages/Podcast";
import { EpisodeDetail } from "./ui/pages/Episode";
import { PodcastProvider } from "./ui/context/PodcastContext";
import "./App.css";

function App() {
  return (
    <PodcastProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/podcast/:id" element={<PodcastDetail />} />
            <Route
              path="/podcast/:podcastId/episode/:episodeId"
              element={<EpisodeDetail />}
            />
          </Routes>
        </Layout>
      </Router>
    </PodcastProvider>
  );
}

export default App;
