export type Chord = {
  name: string;
  notes: string[];
  description: string;
  descriptionEn: string;
  tab: string;
  complexity: 'basic' | 'advanced';
};

export const ALL_CHORDS: Chord[] = [
  { name: 'C Major', notes: ['C3', 'E3', 'G3', 'C4', 'E4'], description: 'C大三和弦。由根音(C)、大三度(E)與完全五度(G)組成，聽起來明亮、開朗且穩定。', descriptionEn: 'C Major Triad. Root(C), major 3rd(E), perfect 5th(G). Sounds bright, cheerful, and stable.', tab: 'X32010', complexity: 'basic' },
  { name: 'C Minor', notes: ['C3', 'G3', 'C4', 'Eb4', 'G4'], description: 'C小三和弦。由根音(C)、小三度(Eb)與完全五度(G)組成，帶有強烈的戲劇性與陰暗面。', descriptionEn: 'C Minor Triad. Root(C), minor 3rd(Eb), perfect 5th(G). Has a strong dramatic and dark feel.', tab: 'X35543', complexity: 'basic' },
  { name: 'D Major', notes: ['D3', 'A3', 'D4', 'F#4'], description: 'D大三和弦。由根音(D)、大三度(F#)與完全五度(A)組成，聲音輝煌、充滿活力。', descriptionEn: 'D Major Triad. Root(D), major 3rd(F#), perfect 5th(A). Sounds brilliant and energetic.', tab: 'XX0232', complexity: 'basic' },
  { name: 'D Minor', notes: ['D3', 'A3', 'D4', 'F4'], description: 'D小三和弦。由根音(D)、小三度(F)與完全五度(A)組成，具有一種古典、深沉的哀愁感。', descriptionEn: 'D Minor Triad. Root(D), minor 3rd(F), perfect 5th(A). Has a classical, deep sorrowful feel.', tab: 'XX0231', complexity: 'basic' },
  { name: 'E Major', notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], description: 'E大三和弦。由根音(E)、大三度(G#)與完全五度(B)組成，給人溫暖、光輝的感覺。', descriptionEn: 'E Major Triad. Root(E), major 3rd(G#), perfect 5th(B). Gives a warm and glowing feeling.', tab: '022100', complexity: 'basic' },
  { name: 'E Minor', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'], description: 'E小三和弦。由根音(E)、小三度(G)與完全五度(B)組成，氛圍較為神秘、內斂。', descriptionEn: 'E Minor Triad. Root(E), minor 3rd(G), perfect 5th(B). Atmosphere is mysterious and introverted.', tab: '022000', complexity: 'basic' },
  { name: 'F Major', notes: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], description: 'F大三和弦。由根音(F)、大三度(A)與完全五度(C)組成，常給人寬廣、充滿希望的感覺。', descriptionEn: 'F Major Triad. Root(F), major 3rd(A), perfect 5th(C). Gives a broad, hopeful feeling.', tab: '133211', complexity: 'basic' },
  { name: 'F Minor', notes: ['F2', 'C3', 'F3', 'Ab3', 'C4', 'F4'], description: 'F小三和弦。由根音(F)、小三度(Ab)與完全五度(C)組成，具有沉重且有力的悲劇感。', descriptionEn: 'F Minor Triad. Root(F), minor 3rd(Ab), perfect 5th(C). Has a heavy and powerful tragic feel.', tab: '133111', complexity: 'basic' },
  { name: 'G Major', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'], description: 'G大三和弦。由根音(G)、大三度(B)與完全五度(D)組成，帶有陽光、前進的感覺。', descriptionEn: 'G Major Triad. Root(G), major 3rd(B), perfect 5th(D). Has a sunny, forward-moving feeling.', tab: '320003', complexity: 'basic' },
  { name: 'G Minor', notes: ['G2', 'D3', 'G3', 'Bb3', 'D4', 'G4'], description: 'G小三和弦。由根音(G)、小三度(Bb)與完全五度(D)組成，有著沉重、嚴肅的氣息。', descriptionEn: 'G Minor Triad. Root(G), minor 3rd(Bb), perfect 5th(D). Has a heavy, serious atmosphere.', tab: '355333', complexity: 'basic' },
  { name: 'A Major', notes: ['A2', 'E3', 'A3', 'C#4', 'E4'], description: 'A大三和弦。由根音(A)、大三度(C#)與完全五度(E)組成，具有明亮、清澈的特質。', descriptionEn: 'A Major Triad. Root(A), major 3rd(C#), perfect 5th(E). Has a bright and clear quality.', tab: 'X02220', complexity: 'basic' },
  { name: 'A Minor', notes: ['A2', 'E3', 'A3', 'C4', 'E4'], description: 'A小三和弦。由根音(A)、小三度(C)與完全五度(E)組成，聽起來帶有憂鬱、柔和的情感。', descriptionEn: 'A Minor Triad. Root(A), minor 3rd(C), perfect 5th(E). Sounds melancholic and soft.', tab: 'X02210', complexity: 'basic' },
  { name: 'B Major', notes: ['B2', 'F#3', 'B3', 'D#4', 'F#4'], description: 'B大三和弦。明亮且具有穿透力。', descriptionEn: 'B Major Triad. Bright and penetrating.', tab: 'X24442', complexity: 'basic' },
  { name: 'B Minor', notes: ['B2', 'F#3', 'B3', 'D4', 'F#4'], description: 'B小三和弦。由根音(B)、小三度(D)與完全五度(F#)組成，音色獨特且帶點淒美。', descriptionEn: 'B Minor Triad. Root(B), minor 3rd(D), perfect 5th(F#). Unique and slightly poignant tone.', tab: 'X24432', complexity: 'basic' },

  { name: 'C maj7', notes: ['C3', 'E3', 'G3', 'B3', 'E4'], description: 'C大七和弦。聽起來浪漫、漂浮、有爵士味。', descriptionEn: 'C Major 7th. Sounds romantic, floating, jazzy.', tab: 'X32000', complexity: 'advanced' },
  { name: 'C m7', notes: ['C3', 'G3', 'Bb3', 'Eb4', 'G4'], description: 'C小七和弦。柔和且帶有憂鬱的藍調感。', descriptionEn: 'C Minor 7th. Soft with a melancholic bluesy feel.', tab: 'X35343', complexity: 'advanced' },
  { name: 'C 7', notes: ['C3', 'E3', 'Bb3', 'C4', 'E4'], description: 'C屬七和弦。具有強烈的緊張感與解決傾向。', descriptionEn: 'C Dominant 7th. Has strong tension and tendency to resolve.', tab: 'X32310', complexity: 'advanced' },
  { name: 'D maj7', notes: ['D3', 'A3', 'C#4', 'F#4'], description: 'D大七和弦。帶有夢幻與金屬般清脆的感覺。', descriptionEn: 'D Major 7th. Has a dreamy and crisp metallic feel.', tab: 'XX0222', complexity: 'advanced' },
  { name: 'D m7', notes: ['D3', 'A3', 'C4', 'F4'], description: 'D小七和弦。溫和、略帶哀愁的流行樂常用和弦。', descriptionEn: 'D Minor 7th. Gentle, slightly sorrowful pop chord.', tab: 'XX0211', complexity: 'advanced' },
  { name: 'D 7', notes: ['D3', 'A3', 'C4', 'F#4'], description: 'D屬七和弦。常做為回歸 G 和弦的強烈過渡。', descriptionEn: 'D Dominant 7th. Often used as a strong transition back to G.', tab: 'XX0212', complexity: 'advanced' },
  { name: 'E maj7', notes: ['E2', 'B2', 'D#3', 'G#3', 'B3', 'E4'], description: 'E大七和弦。豐滿、溫暖且富有和聲張力。', descriptionEn: 'E Major 7th. Plump, warm and full of harmonic tension.', tab: '021100', complexity: 'advanced' },
  { name: 'E m7', notes: ['E2', 'B2', 'E3', 'G3', 'D4', 'E4'], description: 'E小七和弦。空靈、寬廣的小調七和弦。', descriptionEn: 'E Minor 7th. Ethereal, broad minor 7th chord.', tab: '022030', complexity: 'advanced' },
  { name: 'E 7', notes: ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'], description: 'E屬七和弦。藍調音樂中最經典的核心和弦。', descriptionEn: 'E Dominant 7th. The most classic core chord in Blues music.', tab: '020100', complexity: 'advanced' },
  { name: 'F maj7', notes: ['F3', 'A3', 'C4', 'E4'], description: 'F大七和弦。明亮且具有現代感。', descriptionEn: 'F Major 7th. Bright with a modern feel.', tab: 'XX3210', complexity: 'advanced' },
  { name: 'F m7', notes: ['F2', 'C3', 'Eb3', 'Ab3', 'C4', 'F4'], description: 'F小七和弦。沉穩且深情的爵士色彩。', descriptionEn: 'F Minor 7th. Calm and affectionate jazz color.', tab: '131111', complexity: 'advanced' },
  { name: 'F 7', notes: ['F2', 'C3', 'Eb3', 'A3', 'C4', 'F4'], description: 'F屬七和弦。帶有放克與靈魂樂的律動感。', descriptionEn: 'F Dominant 7th. Has a funky and soulful groove.', tab: '131211', complexity: 'advanced' },
  { name: 'G maj7', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'F#4'], description: 'G大七和弦。鄉村與民謠中常出現的開闊感。', descriptionEn: 'G Major 7th. Open feeling common in country and folk.', tab: '320002', complexity: 'advanced' },
  { name: 'G m7', notes: ['G2', 'D3', 'F3', 'Bb3', 'D4', 'G4'], description: 'G小七和弦。渾厚的小調爵士和弦。', descriptionEn: 'G Minor 7th. Thick minor jazz chord.', tab: '353333', complexity: 'advanced' },
  { name: 'G 7', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'F4'], description: 'G屬七和弦。流行樂中最常見的五級屬和弦。', descriptionEn: 'G Dominant 7th. Most common 5th dominant chord in pop.', tab: '320001', complexity: 'advanced' },
  { name: 'A maj7', notes: ['A2', 'E3', 'G#3', 'C#4', 'E4'], description: 'A大七和弦。華麗且高雅的流行和弦。', descriptionEn: 'A Major 7th. Gorgeous and elegant pop chord.', tab: 'X02120', complexity: 'advanced' },
  { name: 'A m7', notes: ['A2', 'E3', 'G3', 'C4', 'E4'], description: 'A小七和弦。憂鬱中帶有一點迷幻的色彩。', descriptionEn: 'A Minor 7th. Melancholic with a slight psychedelic color.', tab: 'X02010', complexity: 'advanced' },
  { name: 'A 7', notes: ['A2', 'E3', 'G3', 'C#4', 'E4'], description: 'A屬七和弦。推動感極強的過渡和弦。', descriptionEn: 'A Dominant 7th. A transition chord with strong driving force.', tab: 'X02020', complexity: 'advanced' },
  { name: 'B maj7', notes: ['B2', 'F#3', 'A#3', 'D#4', 'F#4'], description: 'B大七和弦。充滿張力與現代爵士感。', descriptionEn: 'B Major 7th. Full of tension and modern jazz feel.', tab: 'X24342', complexity: 'advanced' },
  { name: 'B m7', notes: ['B2', 'F#3', 'A3', 'D4', 'F#4'], description: 'B小七和弦。內斂且具律動感的小調和弦。', descriptionEn: 'B Minor 7th. Introverted and groovy minor chord.', tab: 'X24232', complexity: 'advanced' },
  { name: 'B 7', notes: ['B2', 'D#3', 'A3', 'B3', 'F#4'], description: 'B屬七和弦。古典與流行中非常重要的橋樑和弦。', descriptionEn: 'B Dominant 7th. Very important bridge chord in classical and pop.', tab: 'X21202', complexity: 'advanced' },
];

export const getRandomChords = (count: number = 4, includeAdvanced: boolean = false): Chord[] => {
  const pool = includeAdvanced ? ALL_CHORDS : ALL_CHORDS.filter(c => c.complexity === 'basic');
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
