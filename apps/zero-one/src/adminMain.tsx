import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AdminApp } from './AdminApp';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

const container = document.getElementById('admin-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <AdminApp />
    </StrictMode>
  );
}

