import Meyda from 'meyda';

// 0: C, 1: C#, 2: D, 3: D#, 4: E, 5: F, 6: F#, 7: G, 8: G#, 9: A, 10: A#, 11: B
const PITCH_CLASSES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11
};

export type ChallengeConfig = {
  roots: string[]; // e.g. ['C', 'G']
  qualities: string[]; // e.g. ['Major', 'Minor']
  questionCount: number;
};

export type TargetChord = {
  name: string;
  template: number[]; // 12-length array
};

// 輔助函數：將單音與其物理泛音加入模板中
const addNoteProfile = (template: number[], pitch: number, weight: number) => {
  template[pitch % 12] += weight * 1.0;            // 基頻與八度音
  template[(pitch + 7) % 12] += weight * 0.4;      // 完全五度泛音
  template[(pitch + 4) % 12] += weight * 0.15;     // 大三度泛音
};

// Generate target chords based on config
export const generateChallengeChords = (config: ChallengeConfig): TargetChord[] => {
  const allPossible: TargetChord[] = [];
  
  config.roots.forEach(root => {
    config.qualities.forEach(quality => {
      const rootPitch = PITCH_CLASSES[root];
      const template = new Array(12).fill(0);
      
      // 使用泛音權重模板
      addNoteProfile(template, rootPitch, 1.0); // 根音最強
      
      if (quality === 'Major') {
        addNoteProfile(template, rootPitch + 4, 0.9); // Major 3rd
        addNoteProfile(template, rootPitch + 7, 0.8); // Perfect 5th
      } else if (quality === 'Minor') {
        addNoteProfile(template, rootPitch + 3, 0.9); // Minor 3rd
        addNoteProfile(template, rootPitch + 7, 0.8); // Perfect 5th
      } else if (quality === 'maj7') {
        addNoteProfile(template, rootPitch + 4, 0.9); // Major 3rd
        addNoteProfile(template, rootPitch + 7, 0.7); // Perfect 5th
        addNoteProfile(template, rootPitch + 11, 0.8); // Major 7th
      } else if (quality === 'm7') {
        addNoteProfile(template, rootPitch + 3, 0.9); // Minor 3rd
        addNoteProfile(template, rootPitch + 7, 0.7); // Perfect 5th
        addNoteProfile(template, rootPitch + 10, 0.8); // Minor 7th
      } else if (quality === '7') {
        addNoteProfile(template, rootPitch + 4, 0.9); // Major 3rd
        addNoteProfile(template, rootPitch + 7, 0.7); // Perfect 5th
        addNoteProfile(template, rootPitch + 10, 0.8); // Minor 7th
      }
      
      allPossible.push({
        name: `${root} ${quality}`,
        template
      });
    });
  });

  if (allPossible.length === 0) return [];

  // Randomly select questionCount chords
  const selected: TargetChord[] = [];
  for (let i = 0; i < config.questionCount; i++) {
    const randomIndex = Math.floor(Math.random() * allPossible.length);
    selected.push(allPossible[randomIndex]);
  }
  
  return selected;
};

// Calculate cosine similarity between two 12-element arrays
export const calculateCosineSimilarity = (chroma1: number[], chroma2: number[]): number => {
  if (!chroma1 || !chroma2 || chroma1.length !== 12 || chroma2.length !== 12) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < 12; i++) {
    dotProduct += chroma1[i] * chroma2[i];
    norm1 += chroma1[i] * chroma1[i];
    norm2 += chroma2[i] * chroma2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

export const getOppositeTemplate = (chordName: string): number[] => {
  const [root, quality] = chordName.split(' ');
  const rootPitch = PITCH_CLASSES[root];
  if (rootPitch === undefined) return new Array(12).fill(0);
  
  const template = new Array(12).fill(0);
  addNoteProfile(template, rootPitch, 1.0);
  addNoteProfile(template, rootPitch + 7, 0.8); // P5
  
  if (quality === 'Major') {
    addNoteProfile(template, rootPitch + 3, 0.9); // Minor 3rd
  } else if (quality === 'Minor') {
    addNoteProfile(template, rootPitch + 4, 0.9); // Major 3rd
  } else if (quality === 'maj7') {
    addNoteProfile(template, rootPitch + 4, 0.9); 
    addNoteProfile(template, rootPitch + 10, 0.8); // 7 instead of maj7
  } else if (quality === '7') {
    addNoteProfile(template, rootPitch + 4, 0.9);
    addNoteProfile(template, rootPitch + 11, 0.8); // maj7 instead of 7
  } else if (quality === 'm7') {
    addNoteProfile(template, rootPitch + 4, 0.9); // 7 instead of m7
    addNoteProfile(template, rootPitch + 10, 0.8); 
  }
  
  return template;
};

export const getOppositeQualityName = (quality: string): string => {
  if (quality === 'Major') return '小調 (Minor)';
  if (quality === 'Minor') return '大調 (Major)';
  if (quality === 'maj7') return '屬七 (7)';
  if (quality === '7') return '大七 (maj7)';
  if (quality === 'm7') return '屬七 (7)';
  return '其他和弦';
};

let audioContext: AudioContext | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let meydaAnalyzer: any = null;

export type AudioFeatures = {
  chroma: number[];
  mfcc: number[];
  rms: number;
};

export const startMicAnalysis = async (onData: (features: AudioFeatures) => void) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    
    // Biquad Filters for hardware-level denoising
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 80; // Remove AC rumble
    
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3000; // Remove high hiss
    
    mediaStreamSource.connect(highpass);
    highpass.connect(lowpass);
    
    meydaAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext: audioContext,
      source: lowpass,
      bufferSize: 2048,
      featureExtractors: ['chroma', 'mfcc', 'rms'],
      callback: (features: any) => {
        if (features && features.chroma && features.mfcc && features.rms !== undefined) {
          onData({
            chroma: Array.from(features.chroma),
            mfcc: Array.from(features.mfcc),
            rms: features.rms
          });
        }
      }
    });
    
    meydaAnalyzer.start();
    return true;
  } catch (err) {
    console.error("Error accessing microphone", err);
    return false;
  }
};

export const stopMicAnalysis = () => {
  if (meydaAnalyzer) {
    meydaAnalyzer.stop();
    meydaAnalyzer = null;
  }
  if (mediaStreamSource) {
    mediaStreamSource.mediaStream.getTracks().forEach(track => track.stop());
    mediaStreamSource.disconnect();
    mediaStreamSource = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
