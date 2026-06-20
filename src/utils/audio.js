// Module-level AudioContext singleton — unlocked on first user click
let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

export function unlockAudio() {
  try { const ctx = _getAudioCtx(); if (ctx.state === "suspended") ctx.resume(); } catch (_) {}
}

export function playNotificationPing() {
  try {
    const ctx = _getAudioCtx();
    const go = () => {
      [[660, 0], [880, 0.18]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.16);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.17);
      });
    };
    ctx.state === "suspended" ? ctx.resume().then(go).catch(() => {}) : go();
  } catch (_) {}
}
