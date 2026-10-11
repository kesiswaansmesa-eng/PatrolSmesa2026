// Defensive fix for Chrome extensions / interceptors setting window.fetch
try {
  const rawFetch = window.fetch;
  if (typeof rawFetch === 'function') {
    let currentFetch = function (...args: Parameters<typeof fetch>) {
      return rawFetch.apply(window, args);
    };
    const propConfig = {
      configurable: true,
      enumerable: true,
      get: () => currentFetch,
      set: (fn: typeof fetch) => {
        currentFetch = fn;
      },
    };
    try {
      Object.defineProperty(window, 'fetch', propConfig);
    } catch {
      // ignore
    }
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', propConfig);
      } catch {
        // ignore
      }
    }
  }
} catch {
  // ignore
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
