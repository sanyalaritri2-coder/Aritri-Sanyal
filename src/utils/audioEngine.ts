/**
 * Web Audio API Engine for Vintage Vinyl Crackle / Hiss and Audio Synthesis
 */

class VinylHissEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private crackleTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create warm vinyl surface hiss (filtered pink/brown noise)
  private createVinylNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No AudioContext');
    const bufferSize = this.ctx.sampleRate * 3; // 3 seconds loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Trigger occasional vinyl pop/crackle click
  private triggerCrackleClick() {
    if (!this.ctx || !this.isRunning || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // High click sound with randomized frequency
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 4000, this.ctx.currentTime);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);

      const clickVolume = 0.015 + Math.random() * 0.035;
      const now = this.ctx.currentTime;
      clickGain.gain.setValueAtTime(clickVolume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015 + Math.random() * 0.02);

      osc.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }

    // Schedule next crackle at irregular interval
    if (this.isRunning) {
      const nextDelay = Math.random() * 240 + 80; // 80ms - 320ms
      this.crackleTimer = window.setTimeout(() => this.triggerCrackleClick(), nextDelay);
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isRunning) return;

    this.isRunning = true;

    // Master gain for hiss
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.5);

    // Bandpass filter to create vintage warm radio texture
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1800, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    // Noise buffer
    const noiseBuffer = this.createVinylNoiseBuffer();
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseNode.connect(bandpass);
    bandpass.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.noiseNode.start();
    this.triggerCrackleClick();
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        setTimeout(() => {
          if (this.noiseNode) {
            try {
              this.noiseNode.stop();
              this.noiseNode.disconnect();
            } catch {
              // ignore
            }
            this.noiseNode = null;
          }
        }, 350);
      } catch {
        if (this.noiseNode) {
          try {
            this.noiseNode.stop();
          } catch {
            // ignore
          }
        }
      }
    }
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

export const vinylHissEngine = new VinylHissEngine();

// Ambient Cafe Synth Engine for soothing background lo-fi acoustic guitar/rhodes chords
class CafeAcousticEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private sequenceTimer: number | null = null;
  private currentChordIndex = 0;

  // Romantic acoustic cafe chord progressions (Te Amo key: D / Bm / G / A warm jazz/acoustic voicings)
  private chords = [
    [146.83, 220.00, 293.66, 369.99, 440.00], // Dmaj7
    [123.47, 185.00, 246.94, 293.66, 369.99], // Bm7
    [98.00, 196.00, 246.94, 293.66, 392.00],  // Gmaj7
    [110.00, 220.00, 277.18, 329.63, 440.00], // A7sus4
    [130.81, 196.00, 261.63, 329.63, 392.00], // Cadd9
    [146.83, 220.00, 293.66, 349.23, 440.00], // Dm9
  ];

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playChordNotes(chord: number[]) {
    if (!this.ctx || !this.isPlaying || !this.gainNode) return;

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm vintage acoustic / Rhodes tone
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400 - idx * 100, this.ctx.currentTime);

      const stagger = idx * 0.08;
      const now = this.ctx.currentTime + stagger;
      const noteVol = 0.04 - idx * 0.005;

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(noteVol, now + 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 4.0);
    });
  }

  private step() {
    if (!this.isPlaying) return;
    const chord = this.chords[this.currentChordIndex % this.chords.length];
    this.playChordNotes(chord);
    this.currentChordIndex++;
    this.sequenceTimer = window.setTimeout(() => this.step(), 3800);
  }

  public start(volume: number = 0.7) {
    this.init();
    if (!this.ctx || this.isPlaying) return;
    this.isPlaying = true;

    this.gainNode = this.ctx.createGain();
    this.setVolume(volume);
    this.gainNode.connect(this.ctx.destination);

    this.step();
  }

  public stop() {
    this.isPlaying = false;
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(vol * 0.6, this.ctx.currentTime);
    }
  }
}

export const cafeAcousticEngine = new CafeAcousticEngine();
