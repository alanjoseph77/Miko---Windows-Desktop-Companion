import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RealTaskbarRunway } from './components/RealTaskbarRunway';
import './styles/globals.css';
import './styles/companion.css';
import './styles/cosmicEntrance.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

const urlParams = new URLSearchParams(window.location.search);
const isRunwayMode =
  urlParams.get('mode') === 'runway' ||
  window.location.hash.includes('runway');
const runwayTitle = urlParams.get('title') || 'Reminder Alert!';

ReactDOM.createRoot(rootElement).render(
  isRunwayMode ? (
    <RealTaskbarRunway reminderTitle={runwayTitle} />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
