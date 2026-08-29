import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './style.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Khong tim thay phan tu DOM #root de mount React');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
