import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AiCoursePage } from './ai/AiCoursePage';
import './index.css';

/** Single extra route — no router dependency; Vercel rewrites all paths to index.html. */
const path = window.location.pathname.replace(/\/+$/, '') || '/';
const isAiCourse = path === '/ai' || path.startsWith('/ai/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isAiCourse ? <AiCoursePage /> : <App />}</StrictMode>,
);
