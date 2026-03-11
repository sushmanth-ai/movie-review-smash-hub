import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register PWA Service Worker
registerSW({ immediate: true })

try {
  const rootEl = document.getElementById("root");
  if (rootEl) {
    createRoot(rootEl).render(<App />);
  } else {
    console.error('Root element not found');
  }
} catch (error) {
  console.error('Failed to render app:', error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="color:gold;background:#000;padding:2rem;text-align:center;font-family:sans-serif;">
      <h1>⚠️ App Error</h1>
      <p style="color:#ccc;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="location.reload()" style="background:gold;color:#000;padding:8px 24px;border:none;border-radius:20px;font-weight:bold;margin-top:16px;cursor:pointer;">Reload</button>
    </div>`;
  }
}
