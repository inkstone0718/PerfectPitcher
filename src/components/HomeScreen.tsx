import React, { useState } from 'react';
import { type GameMode, type Language } from '../App';

type Props = {
  language: Language;
  onStart: (mode: GameMode) => void;
  onStartChallenge: () => void;
  onStartMultiplayer: () => void;
  onOpenSettings: () => void;
};

const headerStyle: React.CSSProperties = {
  background: '#1a1a24',
  border: '3px solid #f5851f',
  padding: '12px 8px',
  marginBottom: '24px',
};

const inningStyle = (active: boolean): React.CSSProperties => ({
  width: '18px',
  height: '18px',
  background: active ? '#f5851f' : '#1a1a24',
  border: '2px solid #2a2a3a',
  fontSize: '0.4rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: active ? '#0a0a0a' : '#888877',
});

export const HomeScreen: React.FC<Props> = ({ language, onStart, onStartChallenge, onStartMultiplayer, onOpenSettings }) => {
  const [view, setView] = useState<'main' | 'single'>('main');

  return (
    <div className="card">
      {/* Scoreboard header */}
      <div style={headerStyle}>
        <div style={{ fontSize: '0.6rem', color: '#f5851f', marginBottom: '10px', letterSpacing: '3px' }}>
          {'◀ BATTING NOW ▶'}
        </div>
        <h1 className="title" style={{ fontSize: '1.8rem', margin: 0 }}>
          ⚾ PERFECT<br />PITCHER
        </h1>
      </div>

      <p style={{ marginBottom: '32px', fontSize: '0.65rem', color: '#888877', lineHeight: 2.2, letterSpacing: '1px' }}>
        {language === 'zh' ? (
          <>準備上場打擊。<br />訓練你的耳朵，擊出全壘打。</>
        ) : (
          <>STEP UP TO THE PLATE.<br />TRAIN YOUR EARS. HIT A HOME RUN.</>
        )}
      </p>

      {/* Mode select */}
      {view === 'main' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setView('single')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            👤 {language === 'zh' ? '單人練習' : 'SINGLE PLAYER'}
          </button>

          <button
            className="btn"
            onClick={onStartMultiplayer}
            style={{
              background: '#f5851f',
              borderColor: '#f0ece0',
              color: '#0a0a0a',
              boxShadow: '4px 4px 0 #7a3f00',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            🌐 {language === 'zh' ? '多人對戰' : 'MULTIPLAYER'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="btn" onClick={() => setView('main')} style={{ padding: '0', fontSize: '0.8rem', alignSelf: 'flex-start', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none' }}>
            {language === 'zh' ? '◀ 返回' : '◀ BACK'}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => onStart('chord')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            🎵 {language === 'zh' ? '猜和弦' : 'CHORD QUIZ'}
          </button>

          <button
            className="btn"
            onClick={() => onStart('note')}
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--blue)',
              color: 'var(--blue)',
              boxShadow: '4px 4px 0 var(--blue-shadow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            🎵 {language === 'zh' ? '測音感' : 'NOTE QUIZ'}
          </button>

          <button
            className="btn"
            onClick={onStartChallenge}
            style={{
              background: '#f5851f',
              borderColor: '#f0ece0',
              color: '#0a0a0a',
              boxShadow: '4px 4px 0 #7a3f00',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            {language === 'zh' ? '⚡ 實音挑戰' : '⚡ LIVE CHALLENGE'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '32px', marginBottom: '8px' }}>
        <button
          className="btn"
          onClick={onOpenSettings}
          style={{ background: 'transparent', color: '#888877', border: 'none', boxShadow: 'none', padding: '10px' }}
        >
          ⚙️ {language === 'zh' ? '設定' : 'SETTINGS'}
        </button>
      </div>

      {/* Inning counter */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <div key={n} style={inningStyle(n === '1')} >{n}</div>
        ))}
      </div>
    </div>
  );
};
