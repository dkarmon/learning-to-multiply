// ABOUTME: Application entry point that renders the React root.
// ABOUTME: Initializes i18n before mounting the app.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
