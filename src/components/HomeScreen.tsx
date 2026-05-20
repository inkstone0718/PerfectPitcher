import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { HelpCircle, LogIn, LogOut, Trophy, X } from 'lucide-react';
import { type GameMode, type Language } from '../App';
import { getGlobalLeaderboard, getSoloModeLabel, SOLO_MODE_KEYS, type LeaderboardEntry, type SoloModeKey } from '../utils/playerStats';

type Props = {
  language: Language;
  user: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
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

export const HomeScreen: React.FC<Props> = ({ language, user, onSignIn, onSignOut, onStart, onStartChallenge, onStartMultiplayer, onOpenSettings }) => {
  const [view, setView] = useState<'main' | 'single'>('main');
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<SoloModeKey>('chord_basic');
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    if (!showLeaderboard) return;

    let isMounted = true;
    const loadLeaderboard = async () => {
      setIsLeaderboardLoading(true);
      setLeaderboardError('');
      try {
        const entries = await getGlobalLeaderboard(leaderboardMode);
        if (isMounted) setLeaderboardEntries(entries);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setLeaderboardEntries([]);
          setLeaderboardError(language === 'zh' ? '排行榜讀取失敗' : 'Failed to load leaderboard');
        }
      } finally {
        if (isMounted) setIsLeaderboardLoading(false);
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [showLeaderboard, leaderboardMode, language]);

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

      <div style={{ marginBottom: '24px', padding: '12px', background: 'var(--surface-2)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {language === 'zh' ? '玩家帳號' : 'PLAYER ACCOUNT'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user ? (user.displayName || user.email) : (language === 'zh' ? '登入後儲存單人最佳紀錄' : 'Sign in to save solo records')}
          </div>
        </div>
        <button
          className="btn"
          onClick={user ? onSignOut : onSignIn}
          style={{ padding: '10px 12px', fontSize: '0.65rem', background: user ? 'transparent' : 'var(--blue)', color: user ? 'var(--text-muted)' : 'var(--white)', borderColor: user ? 'var(--border)' : 'var(--white)', boxShadow: '3px 3px 0 #000', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {user ? <LogOut size={16} /> : <LogIn size={16} />}
          {user ? (language === 'zh' ? '登出' : 'SIGN OUT') : (language === 'zh' ? 'Google 登入' : 'GOOGLE SIGN IN')}
        </button>
      </div>

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

      <div style={{ marginTop: '32px', marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn"
          onClick={() => setShowLeaderboard(true)}
          style={{ background: 'transparent', color: '#888877', border: 'none', boxShadow: 'none', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Trophy size={18} />
          {language === 'zh' ? '排行榜' : 'LEADERBOARD'}
        </button>
        <button
          className="btn"
          onClick={() => setShowHelp(true)}
          style={{ background: 'transparent', color: '#888877', border: 'none', boxShadow: 'none', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <HelpCircle size={18} />
          {language === 'zh' ? '說明' : 'HELP'}
        </button>
        <button
          className="btn"
          onClick={onOpenSettings}
          style={{ background: 'transparent', color: '#888877', border: 'none', boxShadow: 'none', padding: '10px' }}
        >
          ⚙️ {language === 'zh' ? '設定' : 'SETTINGS'}
        </button>
      </div>

      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content" style={{ textAlign: 'left', maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
              <h2 className="title" style={{ fontSize: '1.2rem', margin: 0 }}>
                {language === 'zh' ? '玩法說明' : 'HOW TO PLAY'}
              </h2>
              <button
                className="btn"
                onClick={() => setShowHelp(false)}
                aria-label={language === 'zh' ? '關閉說明' : 'Close help'}
                style={{ padding: '8px', background: 'transparent', border: 'none', boxShadow: 'none', color: 'var(--text)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text)', lineHeight: 1.9 }}>
              <section>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '6px' }}>
                  {language === 'zh' ? '單人練習' : 'SINGLE PLAYER'}
                </h3>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {language === 'zh'
                    ? '聽完題目音檔後，從四個選項中選出正確的和弦或單音。答題後可重播選項，猜和弦模式也能查看樂理分析。'
                    : 'Listen to the prompt, then choose the correct chord or note from four options. After answering, replay options and open theory notes in chord mode.'}
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '6px' }}>
                  {language === 'zh' ? '實音挑戰' : 'LIVE CHALLENGE'}
                </h3>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {language === 'zh'
                    ? '允許麥克風權限後，依照畫面指定的和弦在吉他上彈奏。系統會用音高分布判斷符合度，達標後自動進入下一題。'
                    : 'Allow microphone access, then play the displayed chord on guitar. The app checks the pitch profile and advances when the match is high enough.'}
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '6px' }}>
                  {language === 'zh' ? '多人對戰' : 'MULTIPLAYER'}
                </h3>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {language === 'zh'
                    ? '建立房間或輸入房號加入朋友的房間。每題先選答案，再按同一個選項確認；答對且越快，分數越高。'
                    : 'Create a room or join with a room code. Select an answer, then tap the same option again to lock it in. Faster correct answers score more.'}
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '6px' }}>
                  {language === 'zh' ? '小提醒' : 'TIPS'}
                </h3>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {language === 'zh'
                    ? '開始前請先開啟聲音。實音挑戰建議在安靜環境中使用，並讓每次彈奏的聲音清楚延續。'
                    : 'Turn on sound before playing. For Live Challenge, use a quiet room and let each chord ring clearly.'}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="modal-content" style={{ textAlign: 'left', maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
              <h2 className="title" style={{ fontSize: '1.2rem', margin: 0 }}>
                {language === 'zh' ? '全球排行榜' : 'GLOBAL LEADERBOARD'}
              </h2>
              <button
                className="btn"
                onClick={() => setShowLeaderboard(false)}
                aria-label={language === 'zh' ? '關閉排行榜' : 'Close leaderboard'}
                style={{ padding: '8px', background: 'transparent', border: 'none', boxShadow: 'none', color: 'var(--text)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginBottom: '18px' }}>
              {SOLO_MODE_KEYS.map(modeKey => (
                <button
                  key={modeKey}
                  className={`btn ${leaderboardMode === modeKey ? 'btn-primary' : 'btn-option'}`}
                  onClick={() => setLeaderboardMode(modeKey)}
                  style={{ padding: '10px 8px', fontSize: '0.58rem' }}
                >
                  {getSoloModeLabel(modeKey, language)}
                </button>
              ))}
            </div>

            {isLeaderboardLoading && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                {language === 'zh' ? '讀取中...' : 'Loading...'}
              </p>
            )}

            {!isLeaderboardLoading && leaderboardError && (
              <p style={{ fontSize: '0.7rem', color: 'var(--error)', textAlign: 'center', padding: '20px' }}>{leaderboardError}</p>
            )}

            {!isLeaderboardLoading && !leaderboardError && leaderboardEntries.length === 0 && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                {language === 'zh' ? '目前還沒有紀錄' : 'No records yet'}
              </p>
            )}

            {!isLeaderboardLoading && !leaderboardError && leaderboardEntries.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboardEntries.map((entry, index) => (
                  <div key={entry.uid} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: '10px', alignItems: 'center', padding: '12px', background: index === 0 ? 'var(--orange)' : 'var(--surface-2)', border: `2px solid ${index === 0 ? 'var(--white)' : 'var(--border)'}`, color: index === 0 ? '#0a0a0a' : 'var(--text)' }}>
                    <div style={{ fontSize: '1rem', textAlign: 'center' }}>{index + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.displayName}</div>
                      <div style={{ marginTop: '4px', fontSize: '0.55rem', opacity: 0.75 }}>
                        {entry.timeMs > 0 ? `${(entry.timeMs / 1000).toFixed(1)}s` : getSoloModeLabel(entry.modeKey, language)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{entry.score}/{entry.total}</div>
                      <div style={{ marginTop: '4px', fontSize: '0.55rem', opacity: 0.75 }}>{entry.percent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inning counter */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <div key={n} style={inningStyle(n === '1')} >{n}</div>
        ))}
      </div>
    </div>
  );
};
