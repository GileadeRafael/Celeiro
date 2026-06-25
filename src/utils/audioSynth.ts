class AudioSynth {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private mainGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private currentGenre: string = 'Lofi';
  private currentVolume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.mainGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public start(genre: string) {
    this.stop();
    this.initContext();
    this.currentGenre = genre;

    if (!this.ctx || !this.mainGain) return;

    // Different musical scales based on genre
    // Pagode/Sertanejo: Major happy progression (I - V - vi - IV)
    // Folk/Acoustic: Sweet Pentatonic Major
    // Lofi: Cool Jazz Minor 7ths
    let notes: number[] = [261.63, 329.63, 392.00, 523.25]; // C major default
    let speed = 1500; // ms between notes

    if (genre.includes('Sertanejo') || genre.includes('Raiz')) {
      notes = [293.66, 369.99, 440.00, 587.33, 440.00, 369.99]; // D Major Arpeggio
      speed = 1000;
    } else if (genre.includes('Pagode')) {
      notes = [261.63, 329.63, 392.00, 493.88, 523.25, 392.00]; // C Maj7 sweet samba arpeggio
      speed = 600;
    } else if (genre.includes('Folk') || genre.includes('Acoustic')) {
      notes = [196.00, 293.66, 329.63, 392.00, 440.00, 587.33]; // G Major Pentatonic
      speed = 1200;
    } else if (genre.includes('Lofi')) {
      notes = [220.00, 261.63, 311.13, 392.00, 440.00]; // A Minor Jazz Flat 5 / Lofi Chill
      speed = 2000;
    }

    let noteIndex = 0;

    const playNote = () => {
      if (!this.ctx || !this.mainGain) return;

      const now = this.ctx.currentTime;
      const freq = notes[noteIndex % notes.length];
      noteIndex++;

      // Create main voice oscillator
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Waveform styling for custom organic timber
      if (this.currentGenre.includes('Lofi')) {
        osc.type = 'triangle'; // Soft, muffled
      } else if (this.currentGenre.includes('Pagode')) {
        osc.type = 'sine'; // Sharp, pluck-like
      } else {
        osc.type = 'triangle'; // Sweet guitar-like pluck
      }

      osc.frequency.setValueAtTime(freq, now);

      // Envelope: smooth pluck
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.3, now + 0.1); // attack
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + (speed / 1000) * 1.5); // decay/release

      osc.connect(noteGain);
      noteGain.connect(this.mainGain);

      // Add simple secondary harmonizing drone for fuller sound
      let subOsc: OscillatorNode | null = null;
      if (noteIndex % 3 === 0) {
        subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq / 2, now); // Octave below

        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + (speed / 1000) * 2);

        subOsc.connect(subGain);
        subGain.connect(this.mainGain);

        subOsc.start(now);
        subOsc.stop(now + (speed / 1000) * 2.1);
        this.activeOscillators.push(subOsc);
      }

      osc.start(now);
      osc.stop(now + (speed / 1000) * 1.6);

      this.activeOscillators.push(osc);

      // Garbage collect old oscillators to avoid memory build-up
      if (this.activeOscillators.length > 20) {
        this.activeOscillators.splice(0, 5);
      }
    };

    // Play first note immediately
    playNote();
    this.intervalId = setInterval(playNote, speed);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Stop all active oscillators safely
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped or not started
      }
    });
    this.activeOscillators = [];
  }
}

export const audioSynthInstance = new AudioSynth();
