import type { User } from 'firebase/auth';
import { get, limitToLast, orderByChild, query, ref, set } from 'firebase/database';
import { db } from './firebase';
import type { GameMode, Language } from '../App';

export type SoloModeKey = 'chord_basic' | 'chord_advanced' | 'note' | 'live_challenge';

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  modeKey: SoloModeKey;
  score: number;
  total: number;
  percent: number;
  timeMs: number;
  rankScore: number;
  updatedAt: number;
};

export const getSoloModeKey = (mode: GameMode, includeAdvanced: boolean): SoloModeKey => {
  if (mode === 'challenge') return 'live_challenge';
  if (mode === 'note') return 'note';
  return includeAdvanced ? 'chord_advanced' : 'chord_basic';
};

export const getSoloModeLabel = (modeKey: SoloModeKey, language: Language) => {
  const labels: Record<SoloModeKey, { zh: string; en: string }> = {
    chord_basic: { zh: '猜和弦 基礎', en: 'Chord Quiz Basic' },
    chord_advanced: { zh: '猜和弦 進階', en: 'Chord Quiz Advanced' },
    note: { zh: '測音感', en: 'Note Quiz' },
    live_challenge: { zh: '實音挑戰', en: 'Live Challenge' },
  };

  return labels[modeKey][language];
};

export const SOLO_MODE_KEYS: SoloModeKey[] = ['chord_basic', 'chord_advanced', 'note', 'live_challenge'];

const safeDisplayName = (user: User) => {
  const source = user.displayName || user.email?.split('@')[0] || 'Player';
  return source.replace(/[^\w\s.-]/g, '').trim().slice(0, 24) || 'Player';
};

const getRankScore = (score: number, total: number, timeMs = 0) => {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const timePenalty = timeMs > 0 ? Math.min(99999, Math.round(timeMs / 100)) : 0;
  return 100000000 + percent * 100000 + score * 1000 - timePenalty;
};

export const saveSoloResult = async (
  user: User,
  modeKey: SoloModeKey,
  score: number,
  total: number,
  timeMs = 0
) => {
  const now = Date.now();
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const rankScore = getRankScore(score, total, timeMs);
  const entry: LeaderboardEntry = {
    uid: user.uid,
    displayName: safeDisplayName(user),
    modeKey,
    score,
    total,
    percent,
    timeMs,
    rankScore,
    updatedAt: now,
  };

  await set(ref(db, `users/${user.uid}/profile`), {
    uid: user.uid,
    displayName: entry.displayName,
    email: user.email || '',
    updatedAt: now,
  });

  const bestRef = ref(db, `users/${user.uid}/bestScores/${modeKey}`);
  const currentBest = (await get(bestRef)).val() as LeaderboardEntry | null;

  if (!currentBest || rankScore > currentBest.rankScore) {
    await Promise.all([
      set(bestRef, entry),
      set(ref(db, `leaderboards/${modeKey}/${user.uid}`), entry),
    ]);
    return true;
  }

  return false;
};

export const getGlobalLeaderboard = async (modeKey: SoloModeKey, limit = 10) => {
  const boardQuery = query(ref(db, `leaderboards/${modeKey}`), orderByChild('rankScore'), limitToLast(limit));
  const snapshot = await get(boardQuery);
  const value = snapshot.val() as Record<string, LeaderboardEntry> | null;

  return Object.values(value || {}).sort((a, b) => {
    if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
    return a.updatedAt - b.updatedAt;
  });
};
