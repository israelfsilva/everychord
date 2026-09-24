import * as Tone from 'tone';
import type { ChordVoicing, FretMarker } from '../core/types';
import { useChordStore } from '../store/chord-store';

export interface StrumOptions {
  staggerMs?: number;        // time between strings (default 30ms)
  direction?: 'down' | 'up'; // 'down' = low to high string, 'up' = high to low string
  velocity?: number;         // 0.0 to 1.0 (default 0.8)
  noteDuration?: string;     // Tone duration string (default "2n")
  onStringVibrate?: (stringIndex: number) => void;
}

export interface AudioDriver {
  init(): Promise<void>;
  triggerAttackRelease(
    note: string,
    duration: number | string,
    time?: number,
    velocity?: number
  ): void;
  dispose(): void;
}

export interface NoteEvent {
  note: string;
  duration: number | string;
  time?: number;
  velocity?: number;
}

export class MockAudioDriver implements AudioDriver {
  public history: NoteEvent[] = [];

  async init(): Promise<void> {
    return Promise.resolve();
  }

  triggerAttackRelease(
    note: string,
    duration: number | string,
    time?: number,
    velocity?: number
  ): void {
    this.history.push({ note, duration, time, velocity });
  }

  dispose(): void {
    this.history = [];
  }
}

export class ToneAudioDriver implements AudioDriver {
  private synth: Tone.PolySynth | null = null;
  private filter: Tone.Filter | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized && this.synth) return;

    if (typeof window === 'undefined' || !(window.AudioContext || (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext)) {
      throw new Error('Web Audio API not supported in this environment');
    }

    await Tone.start();

    // Gentle low-pass filter to give acoustic wood warmth
    this.filter = new Tone.Filter({
      frequency: 4500,
      type: 'lowpass',
      rolloff: -12,
    }).toDestination();

    // High quality pluck acoustic synthesizer
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.005,
        decay: 1.4,
        sustain: 0.08,
        release: 1.2,
      },
    }).connect(this.filter);

    this.synth.volume.value = -4; // comfortable studio headroom
    this.isInitialized = true;
  }

  triggerAttackRelease(
    note: string,
    duration: number | string,
    time?: number,
    velocity?: number
  ): void {
    if (!this.synth) return;
    try {
      if (time !== undefined) {
        this.synth.triggerAttackRelease(note, duration, time, velocity);
      } else {
        this.synth.triggerAttackRelease(note, duration, undefined, velocity);
      }
    } catch (err) {
      console.warn('Tone trigger error:', err);
    }
  }

  dispose(): void {
    this.synth?.dispose();
    this.filter?.dispose();
    this.synth = null;
    this.filter = null;
    this.isInitialized = false;
  }
}

export interface SoundEngineConfig {
  useMockDriver?: boolean;
}

export class SoundEngine {
  private driver: AudioDriver;
  private isTestMode: boolean;
  public isReady = false;

  constructor(config: SoundEngineConfig = {}) {
    const isNodeOrTest =
      typeof window === 'undefined' ||
      import.meta.env?.MODE === 'test' ||
      Boolean(config.useMockDriver);

    this.isTestMode = isNodeOrTest;
    this.driver = isNodeOrTest ? new MockAudioDriver() : new ToneAudioDriver();
  }

  async init(): Promise<boolean> {
    try {
      await this.driver.init();
      this.isReady = true;
      return true;
    } catch (err) {
      if (!this.isTestMode) {
        console.warn('SoundEngine initialization deferred to user gesture:', err);
      }
      return false;
    }
  }

  getDriver(): MockAudioDriver {
    return this.driver as MockAudioDriver;
  }

  playNote(note: string, velocity = 0.8, duration = '2n'): boolean {
    if (!this.isReady) {
      this.init().then(() => {
        this.driver.triggerAttackRelease(note, duration, undefined, velocity);
      });
      return true;
    }
    this.driver.triggerAttackRelease(note, duration, undefined, velocity);
    return true;
  }

  async strumChord(
    voicing: ChordVoicing,
    options: StrumOptions = {}
  ): Promise<void> {
    const staggerMs = options.staggerMs ?? 32;
    const direction = options.direction ?? 'down';
    const baseVelocity = options.velocity ?? 0.8;
    const duration = options.noteDuration ?? '2n';

    if (!this.isReady) {
      await this.init();
    }

    // Extract sounding markers
    const soundingMarkers = (voicing.markers || []).filter(
      (m: FretMarker) => m.fret >= 0 && m.note
    );

    if (soundingMarkers.length === 0) return;

    // Order notes by string index based on direction
    const ordered = [...soundingMarkers].sort((a, b) =>
      direction === 'down'
        ? a.stringIndex - b.stringIndex
        : b.stringIndex - a.stringIndex
    );

    useChordStore.getState().setIsPlaying(true);

    return new Promise<void>((resolve) => {
      ordered.forEach((marker, idx) => {
        const trigger = () => {
          // Slight natural velocity variation across strings
          const velocityVariance = (Math.random() - 0.5) * 0.1;
          const velocity = Math.max(0.3, Math.min(1.0, baseVelocity + velocityVariance));

          this.driver.triggerAttackRelease(marker.note, duration, undefined, velocity);

          // Update store for visual string vibration feedback
          useChordStore.getState().setActiveStringIndex(marker.stringIndex);
          options.onStringVibrate?.(marker.stringIndex);

          // If this is the last note, schedule strum completion
          if (idx === ordered.length - 1) {
            setTimeout(() => {
              useChordStore.getState().setActiveStringIndex(null);
              useChordStore.getState().setIsPlaying(false);
              resolve();
            }, 250);
          }
        };

        if (idx === 0) {
          trigger();
        } else {
          setTimeout(trigger, idx * staggerMs);
        }
      });
    });
  }
}

// Global SoundEngine singleton for application use
export const soundEngine = new SoundEngine();
