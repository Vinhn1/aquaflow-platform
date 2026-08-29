import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import 'zmp-ui/zaui.css';
import 'leaflet/dist/leaflet.css';
import './style.css';

/**
 * Dam bao co container DOM #app de React mount vao
 */
function ensureRootContainer(): HTMLElement {
  let appEl = document.getElementById('app');
  if (!appEl) {
    appEl = document.createElement('div');
    appEl.id = 'app';
    document.body.appendChild(appEl);
  }
  return appEl;
}

function bootstrap() {
  const container = ensureRootContainer();
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
