import { BrowserRouter } from 'react-router-dom';
import { PodcastProvider } from './ui/context/PodcastContext';
import { Layout } from './ui/components/Layout';
import { AppRouter } from './app/router';

function App() {
  return (
    <BrowserRouter>
      <PodcastProvider>
        <Layout>
          <AppRouter />
        </Layout>
      </PodcastProvider>
    </BrowserRouter>
  );
}

export default App;
