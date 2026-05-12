import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { type Language } from '../App';

type Props = {
  language: Language;
  score: number;
  total: number;
  timeMs?: number;
  onRestart: () => void;
  onHome: () => void;
};

export const ResultScreen: React.FC<Props> = ({ language, score, total, timeMs, onRestart, onHome }) => {
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

