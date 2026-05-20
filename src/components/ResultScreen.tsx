import React, { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { type Language } from '../App';
import { getSoloModeLabel, saveSoloResult, type SoloModeKey } from '../utils/playerStats';

type Props = {
  language: Language;
  user: User | null;
  modeKey: SoloModeKey;
  score: number;
  total: number;
  timeMs?: number;
  onSignIn: () => Promise<void>;
  onRestart: () => void;
  onHome: () => void;
};

export const ResultScreen: React.FC<Props> = ({ language, user, modeKey, score, total, timeMs, onSignIn, onRestart, onHome }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'unchanged' | 'error'>('idle');
  const savedResultKeyRef = useRef('');

  useEffect(() => {
    if (score > total / 2) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#1a56e8', '#f5851f', '#f0ece0', '#22c55e']
      });
    }
  }, [score, total]);

  useEffect(() => {
    if (!user) {
      setSaveStatus('idle');
      savedResultKeyRef.current = '';
      return;
    }

    const resultKey = `${user.uid}:${modeKey}:${score}:${total}:${timeMs || 0}`;
    if (savedResultKeyRef.current === resultKey) return;

    savedResultKeyRef.current = resultKey;
    setSaveStatus('saving');
    saveSoloResult(user, modeKey, score, total, timeMs || 0)
      .then(isNewBest => setSaveStatus(isNewBest ? 'saved' : 'unchanged'))
      .catch(error => {
        console.error(error);
        setSaveStatus('error');
      });
  }, [user, modeKey, score, total, timeMs]);

  const pct = Math.round((score / total) * 100);
  const verdict =
    score === total ? (language === 'zh' ? '🏆 完美過關！' : '🏆 PERFECT GAME!') :
    score >= total * 0.8 ? (language === 'zh' ? '⚾ 全壘打！' : '⚾ HOME RUN!') :
    score >= total * 0.5 ? (language === 'zh' ? '👍 打得不錯' : '👍 GOOD SWING') : 
    (language === 'zh' ? '⚡ 繼續努力' : '⚡ KEEP TRAINING');

  return (
    <div className="card">
      {/* Final scoreboard header */}
      <div style={{ background: 'var(--surface-2)', border: '3px solid var(--accent)', padding: '10px', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '3px' }}>
          {language === 'zh' ? '◀ 最終成績 ▶' : '◀ FINAL SCORE ▶'}
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '2px' }}>
        {language === 'zh' ? '遊戲結束' : 'GAME OVER'}
      </h2>

      <div className="result-score">{score} / {total}</div>

      {/* Percentage bar */}
      <div style={{ background: '#1a1a24', border: '2px solid #2a2a3a', height: '24px', marginBottom: '16px', position: 'relative' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: pct >= 80 ? '#f5851f' : '#1a56e8',
          transition: 'width 1s steps(20)',
        }} />
        <span style={{ position: 'absolute', right: '8px', top: '2px', fontSize: '0.65rem', color: '#f0ece0' }}>{pct}%</span>
      </div>

      <p style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--accent)', letterSpacing: '2px' }}>{verdict}</p>

      {timeMs !== undefined && timeMs > 0 && (
        <p style={{ fontSize: '0.85rem', marginBottom: '20px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          {language === 'zh' ? '時間:' : 'TIME:'} <span style={{ color: 'var(--text)' }}>{(timeMs / 1000).toFixed(1)}s</span>
        </p>
      )}

      <div style={{ background: 'var(--surface-2)', border: '2px solid var(--border)', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {language === 'zh' ? '紀錄模式' : 'RECORD MODE'}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '10px' }}>
          {getSoloModeLabel(modeKey, language)}
        </div>
        {user ? (
          <p style={{ fontSize: '0.65rem', color: saveStatus === 'error' ? 'var(--error)' : 'var(--text-muted)', lineHeight: 1.8 }}>
            {saveStatus === 'saving' && (language === 'zh' ? '正在儲存紀錄...' : 'Saving record...')}
            {saveStatus === 'saved' && (language === 'zh' ? '新的個人最佳已儲存，並更新全球排行榜。' : 'New personal best saved and posted to the global leaderboard.')}
            {saveStatus === 'unchanged' && (language === 'zh' ? '已登入。本次成績未超過目前最佳紀錄。' : 'Signed in. This run did not beat your best record.')}
            {saveStatus === 'error' && (language === 'zh' ? '紀錄儲存失敗，請稍後再試。' : 'Failed to save record. Please try again later.')}
            {saveStatus === 'idle' && (language === 'zh' ? '已登入，準備儲存紀錄。' : 'Signed in and ready to save records.')}
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, flex: 1, minWidth: '180px' }}>
              {language === 'zh' ? '使用 Google 登入即可儲存個人最佳並加入排行榜。' : 'Sign in with Google to save personal bests and join the leaderboard.'}
            </p>
            <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '0.65rem' }} onClick={onSignIn}>
              {language === 'zh' ? 'Google 登入' : 'SIGN IN'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={onRestart}>
          {language === 'zh' ? '▶ 再玩一次' : '▶ PLAY AGAIN'}
        </button>
        <button className="btn" style={{ background: 'var(--surface-2)', borderColor: 'var(--text-muted)', color: 'var(--text-muted)', boxShadow: '3px 3px 0 #000' }} onClick={onHome}>
          {language === 'zh' ? '⌂ 返回首頁' : '⌂ MENU'}
        </button>
      </div>
    </div>
  );
};
