// ABOUTME: Application entry point that renders the React root.
// ABOUTME: Initializes i18n and global styles before mounting the app.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
