
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim process.env for browser compatibility if it's not defined
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
