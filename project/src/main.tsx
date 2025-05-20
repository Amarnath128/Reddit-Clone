import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Set up dark mode based on system preferences or saved preference
if (typeof window !== 'undefined') {
  const darkModePreference = 
    localStorage.getItem('theme') === 'dark' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  document.documentElement.classList.toggle('dark', darkModePreference);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);