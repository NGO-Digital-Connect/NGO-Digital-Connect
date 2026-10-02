import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Interactive Button Tactile Ripple Feedback
if (typeof window !== 'undefined') {
  document.addEventListener('pointerdown', (e: PointerEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btn = (e.target as HTMLElement)?.closest?.('.btn') as HTMLElement | null;
    if (!btn || btn.hasAttribute('disabled') || btn.classList.contains('disabled')) return;

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.3';
    ripple.style.backgroundColor = 'currentColor';
    ripple.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease-out';
    ripple.style.zIndex = '1';

    btn.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });

    setTimeout(() => {
      ripple.remove();
    }, 400);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
