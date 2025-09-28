import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PodcastProvider } from '../ui/context/PodcastContext';
import { Layout } from '../ui/components/Layout';
import { AppRouter } from './router';
import '../ui/styles/base.css';
import '../ui/styles/variables.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <PodcastProvider>
        <Layout>
          <AppRouter />
        </Layout>
      </PodcastProvider>
    </BrowserRouter>
  </StrictMode>
);
//no console logs in promise
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {})
      .catch(() => {});
  });
}
