/**
 * soundService — plays notification sounds using the Web Audio API.
 * No external files needed — sounds are generated programmatically.
 * Toggle stored in localStorage so preference persists across sessions.
 */

const STORAGE_KEY = 'smartcampus_sound_enabled';

function isSoundEnabled() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === 'true'; // default ON
}

function setSoundEnabled(val) {
  localStorage.setItem(STORAGE_KEY, String(val));
}

function toggleSound() {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  return next;
}

/** Creates a short tone using Web Audio API */
function playTone(frequency = 520, duration = 0.18, type = 'sine', volume = 0.25) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Web Audio not supported — silent fail
  }
}

/** Different sounds per notification category */
function playNotificationSound(type = '') {
  if (type.startsWith('BOOKING')) {
    // Booking — two ascending tones
    playTone(480, 0.15);
    setTimeout(() => playTone(640, 0.2), 160);
  } else if (type.startsWith('TICKET')) {
    // Ticket — single mid tone
    playTone(440, 0.22, 'triangle');
  } else if (type.startsWith('RESOURCE')) {
    // Resource alert — lower warning tone
    playTone(320, 0.28, 'square', 0.15);
  } else {
    // Default (account, user, general) — soft single ding
    playTone(520, 0.18, 'sine');
  }
}

export const soundService = {
  isSoundEnabled,
  toggleSound,
  playNotificationSound,
};