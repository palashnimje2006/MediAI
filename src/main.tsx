import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter benign internal Firestore idle stream timeout notices and popup dismissal events
const isBenignNotice = (msg: string) =>
  msg.includes('Disconnecting idle stream') ||
  msg.includes("RPC 'Listen' stream") ||
  msg.includes('auth/popup-closed-by-user') ||
  msg.includes('auth/cancelled-popup-request');

const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (isBenignNotice(msg)) return;
  origWarn(...args);
};

const origError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (isBenignNotice(msg)) return;
  origError(...args);
};

createRoot(document.getElementById('root')!).render(<App />);

