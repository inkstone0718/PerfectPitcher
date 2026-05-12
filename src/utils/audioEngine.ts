// @ts-ignore
import Soundfont from 'soundfont-player';

let instrument: any = null;

export const initAudio = async () => {
  if (!instrument) {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Load a realistic steel acoustic guitar soundfont
    instrument = await Soundfont.instrument(ac, 'acoustic_guitar_steel');
  }
};

export const playChord = (notes: string[]) => {
  if (!instrument) return;
  const now = instrument.context.currentTime;
  // Slightly staggered start times to simulate strumming a guitar
  notes.forEach((note, i) => {
    instrument.play(note, now + i * 0.04, { duration: 2.5, gain: 2.0 });
  });
};

export const playNote = (note: string) => {
  if (!instrument) return;
  const now = instrument.context.currentTime;
  instrument.play(note, now, { duration: 2.0, gain: 2.0 });
};
