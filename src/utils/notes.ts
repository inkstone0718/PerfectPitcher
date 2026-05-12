export type SingleNote = {
  name: string;
  notes: string[];
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ALL_NOTES: SingleNote[] = [];

for (let octave = 2; octave <= 6; octave++) {
  for (const noteName of NOTE_NAMES) {
    ALL_NOTES.push({
      name: `${noteName}${octave}`,
      notes: [`${noteName}${octave}`]
    });
  }
}

export const getRandomNotes = (count: number = 4): SingleNote[] => {
  const shuffled = [...ALL_NOTES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
