class SoundEngine {
  private ctx: AudioContext | null = null;
  public sfxEnabled = true;
  public voiceEnabled = true;

  private getContext(): AudioContext | null {
    if (!this.sfxEnabled) return null;
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.16,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(620, 0.06, 'triangle', 0.12, 0, 780);
  }

  playFlip() {
    this.playTone(380, 0.09, 'sine', 0.12, 0, 680);
  }

  playSelect() {
    this.playTone(523.25, 0.08, 'triangle', 0.13, 0, 659.25);
  }

  playMatch(combo = 1) {
    const semitoneBoost = Math.min(combo - 1, 6);
    const ratio = Math.pow(2, semitoneBoost / 12);
    const root = 523.25 * ratio; // C5 upward
    this.playTone(root, 0.14, 'triangle', 0.18, 0);
    this.playTone(root * 1.25, 0.14, 'triangle', 0.18, 0.07);
    this.playTone(root * 1.5, 0.24, 'sine', 0.2, 0.14);
  }

  playGoldenMatch() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.2, 'triangle', 0.16, idx * 0.06);
    });
  }

  playFever() {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'sine', 0.17, idx * 0.055);
    });
  }

  playMismatch() {
    // Soft cartoon "boing" rather than harsh buzzer
    this.playTone(310, 0.14, 'triangle', 0.13, 0, 230);
    this.playTone(230, 0.18, 'triangle', 0.11, 0.12, 185);
  }

  playPowerup() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.16, 'sine', 0.14, idx * 0.05);
    });
  }

  playStageClear() {
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.11 },
      { f: 783.99, d: 0.14, t: 0.22 },
      { f: 1046.5, d: 0.34, t: 0.34 },
      { f: 783.99, d: 0.12, t: 0.56 },
      { f: 1046.5, d: 0.42, t: 0.68 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'triangle', 0.19, m.t);
      this.playTone(m.f * 0.5, m.d, 'sine', 0.08, m.t);
    });
  }

  playGameOver() {
    const melody = [
      { f: 392.0, d: 0.18, t: 0 },
      { f: 349.23, d: 0.18, t: 0.16 },
      { f: 329.63, d: 0.28, t: 0.32 },
      { f: 392.0, d: 0.26, t: 0.56 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'sine', 0.14, m.t);
    });
  }

  speakKorean(text: string) {
    if (!this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = 0.88;
      utter.pitch = 1.08;
      utter.volume = 0.9;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors on unsupported browsers
    }
  }
}

export const soundEngine = new SoundEngine();
