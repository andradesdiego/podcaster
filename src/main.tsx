import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/styles/variables.css';
import './ui/styles/base.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
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
