import './style.css';
import LoveTimerApp from './timer.js';

export function initializeLoveTimer() {
  const timer = new LoveTimerApp();
  timer.init();
  if (typeof window !== 'undefined') {
    window.loveTimer = timer;
  }
}

document.addEventListener('DOMContentLoaded', initializeLoveTimer);
