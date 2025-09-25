import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { PodcastProvider } from "./context/PodcastContext";
import "./App.css";

function App() {
  return (
    <PodcastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/podcast/:id"
              element={<div>Podcast Detail - Coming Soon</div>}
            />
          </Routes>
        </Layout>
      </Router>
    </PodcastProvider>
  );
}

export default App;
