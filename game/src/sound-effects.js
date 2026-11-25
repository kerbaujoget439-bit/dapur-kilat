// Kitchen sounds, all synthesized with WebAudio — no audio files, no network.
// Chop thunks, pickup pops, a serving ding, an error buzz, a sizzle loop while the
// wok cooks, and a little fanfare when the shift ends well.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.sizzleGain = null;
    this.sizzleOn = false;
    this.muted = false;
  }

  /** Create the audio context on the first real gesture (browsers demand one). */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    } catch {
      this.ctx = null;
    }
  }

  tone(frequency, duration, type, volume, when) {
    if (!this.ctx || this.muted) return;
    const start = this.ctx.currentTime + (when || 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume || 0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  noiseBurst(duration, volume, filterFrequency) {
    if (!this.ctx || this.muted) return;
    const start = this.ctx.currentTime;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFrequency || 1200;
    const gain = this.ctx.createGain();
    gain.gain.value = volume || 0.2;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(start);
  }

  chop() {
    this.noiseBurst(0.09, 0.3, 900);
    this.tone(170, 0.08, 'sine', 0.18);
  }

  pop() {
    this.tone(520, 0.07, 'sine', 0.12);
    this.tone(760, 0.06, 'sine', 0.08, 0.05);
  }

  ding() {
    this.tone(880, 0.16, 'sine', 0.14);
    this.tone(1318, 0.22, 'sine', 0.12, 0.09);
  }

  buzz() {
    this.tone(110, 0.18, 'sawtooth', 0.1);
    this.tone(98, 0.18, 'sawtooth', 0.08, 0.02);
  }

  tick() {
    this.tone(1040, 0.05, 'square', 0.05);
  }

  fanfare() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((note, i) => this.tone(note, 0.22, 'triangle', 0.14, i * 0.11));
  }

  /** A rising chime for a serving streak — higher with every dish in a row. */
  streak(level) {
    const base = 660 + Math.min(level, 6) * 60;
    this.tone(base, 0.12, 'triangle', 0.12);
    this.tone(base * 1.25, 0.16, 'triangle', 0.1, 0.07);
  }

  sadTrombone() {
    const notes = [392, 370, 349, 311];
    notes.forEach((note, i) => this.tone(note, 0.3, 'triangle', 0.1, i * 0.16));
  }

  /** A looping filtered-noise sizzle while something cooks in the wok. */
  setSizzle(on) {
    if (!this.ctx) return;
    if (on === this.sizzleOn) return;
    this.sizzleOn = on;
    if (on) {
      const length = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 5200;
      filter.Q.value = 0.6;
      const gain = this.ctx.createGain();
      gain.gain.value = this.muted ? 0 : 0.045;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
      this.sizzleGain = gain;
      this.sizzleSource = source;
    } else if (this.sizzleSource) {
      try { this.sizzleSource.stop(); } catch { /* already stopped */ }
      this.sizzleSource = null;
      this.sizzleGain = null;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.sizzleGain) this.sizzleGain.gain.value = muted ? 0 : 0.045;
    if (muted) this.setSizzle(false);
  }
}
