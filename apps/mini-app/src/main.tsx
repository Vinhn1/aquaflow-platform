import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { ToastProvider } from './context/ToastContext.js';
import SnackbarProvider from 'zmp-ui/snackbar-provider';
import { configAppView } from 'zmp-sdk';
import 'zmp-ui/zaui.css';
import 'leaflet/dist/leaflet.css';
import './style.css';

// Kích hoạt Native Bridge Zalo để tính toán Safe Area Top chính xác cho Android/iOS
try {
  configAppView({
    statusBarType: 'transparent',
    actionBar: {
      hide: true,
    },
  });
} catch {
  // Bỏ qua khi chạy trong môi trường web dev
}

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
      <SnackbarProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SnackbarProvider>
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
