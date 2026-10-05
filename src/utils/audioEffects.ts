// Web Audio API Sound Synthesizer for Miko's Cosmic Animations

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (err) {
        console.warn('AudioContext not available:', err);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Deep spatial whoosh for black hole opening
  playBlackHoleSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low frequency swirl
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(60, now + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.6);
      filter.frequency.linearRampToValueAtTime(180, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // Audio fallback silent
    }
  }

  // Play ascending game-style bounce chord when hopping on an app icon
  playIconJumpSound(stepIndex: number): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const baseNotes = [440, 493.88, 554.37, 587.33, 659.25, 739.99, 830.61, 880];
      const freq = baseNotes[stepIndex % baseNotes.length] || 520;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Fallback
    }
  }

  // Celebratory landing chord with sparkles
  playLandingSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C major chord

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.04 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.95);
      });
    } catch {
      // Fallback
    }
  }
}

export const soundFx = new SoundSynthesizer();
