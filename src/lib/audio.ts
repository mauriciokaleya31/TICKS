// Simple synthesized sound effects using the browser's Web Audio API
// This avoids downloading external assets and ensures 100% offline availability and instant playback.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume context if suspended (browsers auto-suspend AudioContext until user interaction)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playSound = {
  // Soft, tactile click
  click() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  // Crispy, delightful dual-tone chime (e.g. duplicating an event, adding a coupon)
  success() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Low frequency tone followed by higher frequency tone
    [
      { time: 0, freq: 523.25, duration: 0.15 }, // C5
      { time: 0.08, freq: 659.25, duration: 0.25 } // E5
    ].forEach(({ time, freq, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);
      
      gain.gain.setValueAtTime(0.06, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  },

  // Interactive cash register "Cha-ching!" sound (perfect for checkout / ticket purchases!)
  cashRegister() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Initial high-pitched metal ring (bell)
    const bellOsc1 = ctx.createOscillator();
    const bellOsc2 = ctx.createOscillator();
    const bellGain = ctx.createGain();

    bellOsc1.type = "sine";
    bellOsc1.frequency.setValueAtTime(1568, now); // G6
    bellOsc2.type = "triangle";
    bellOsc2.frequency.setValueAtTime(1975.5, now); // B6

    bellGain.gain.setValueAtTime(0.08, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    bellOsc1.connect(bellGain);
    bellOsc2.connect(bellGain);
    bellGain.connect(ctx.destination);

    bellOsc1.start(now);
    bellOsc2.start(now);
    bellOsc1.stop(now + 0.35);
    bellOsc2.stop(now + 0.35);

    // 2. The physical mechanical rattle (clink-clack)
    setTimeout(() => {
      const rattleCtx = getAudioContext();
      if (!rattleCtx) return;
      const rTime = rattleCtx.currentTime;

      const noiseOsc = rattleCtx.createOscillator();
      const noiseGain = rattleCtx.createGain();

      noiseOsc.type = "triangle";
      noiseOsc.frequency.setValueAtTime(120, rTime);
      noiseOsc.frequency.linearRampToValueAtTime(80, rTime + 0.12);

      noiseGain.gain.setValueAtTime(0.05, rTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, rTime + 0.12);

      noiseOsc.connect(noiseGain);
      noiseGain.connect(rattleCtx.destination);

      noiseOsc.start(rTime);
      noiseOsc.stop(rTime + 0.12);
    }, 150);
  },

  // Warm login sound (ascending sweep)
  login() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.04, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }
};
