import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { PodcastDetail } from "./pages/PodcastDetail";
import { EpisodeDetail } from "./pages/EpisodeDetail";
import { PodcastProvider } from "./context/PodcastContext";
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
