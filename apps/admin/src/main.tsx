import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { Toaster } from 'sonner';
import './style.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Khong tim thay phan tu DOM #root de mount React');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13px' },
      }}
    />
  </React.StrictMode>
);
