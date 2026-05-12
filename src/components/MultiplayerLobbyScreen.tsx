import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase';
import { ref, set, get, onValue, update, off } from 'firebase/database';
import { ALL_CHORDS } from '../utils/chords';
import { ALL_NOTES } from '../utils/notes';
import type { Language } from '../App';

export type MultiplayerMode = 'chord' | 'note';

export type Player = {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  ready: boolean;
};

export type Room = {
  id: string;
  host: string;
  mode: MultiplayerMode;
  maxPlayers: number;
  targetScore: number;
  status: 'waiting' | 'playing' | 'finished';
  players: Record<string, Player>;
  currentQuestion: number;
  currentAnswer: string;
  questionStartTime: number;
  answers: Record<string, { answer: string; time: number }>;
};

type Props = {
  language: Language;
  onGameStart: (roomId: string, playerId: string, playerName: string) => void;
  onBack: () => void;
};

const generateRoomCode = () =>
  Math.random().toString(36).substring(2, 6).toUpperCase();

const generatePlayerId = () =>
  Math.random().toString(36).substring(2, 10);

export const MultiplayerLobbyScreen: React.FC<Props> = ({ language, onGameStart, onBack }) => {
  const [view, setView] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myRoomCode, setMyRoomCode] = useState('');
  const [playerId] = useState(generatePlayerId);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [mode, setMode] = useState<MultiplayerMode>('chord');
  const [targetScore, setTargetScore] = useState(1000);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (zh: string, en: string) => language === 'zh' ? zh : en;

  // Watch room status
  useEffect(() => {
    if (!myRoomCode || view !== 'waiting') return;

    const roomRef = ref(db, `rooms/${myRoomCode}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as Room | null;
      if (!data) return;
      setRoom(data);
      if (data.status === 'playing') {
        onGameStart(myRoomCode, playerId, playerName);
      }
    });

    return () => off(roomRef);
  }, [myRoomCode, view, onGameStart, playerId, playerName]);

  // Clean up on host disconnect
  const handleLeave = useCallback(async () => {
    if (!myRoomCode) return;
    if (isHost) {
      await set(ref(db, `rooms/${myRoomCode}`), null);
    } else {
      await set(ref(db, `rooms/${myRoomCode}/players/${playerId}`), null);
    }
    setView('menu');
    setRoom(null);
    setMyRoomCode('');
  }, [myRoomCode, isHost, playerId]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) { setError(t('請輸入暱稱', 'Enter your nickname')); return; }
    setLoading(true);
    setError('');
    try {
      const code = generateRoomCode();
      const newRoom: Room = {
        id: code,
        host: playerId,
        mode,
        maxPlayers,
        targetScore,
        status: 'waiting',
        players: {
          [playerId]: { id: playerId, name: playerName.trim(), score: 0, isHost: true, ready: true },
        },
        currentQuestion: 0,
        currentAnswer: '',
        questionStartTime: 0,
        answers: {},
      };
      await set(ref(db, `rooms/${code}`), newRoom);
      setMyRoomCode(code);
      setIsHost(true);
      setRoom(newRoom);
      setView('waiting');
    } catch (e) {
      setError(t('建立房間失敗，請確認網路連線', 'Failed to create room. Check your connection.'));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) { setError(t('請輸入暱稱', 'Enter your nickname')); return; }
    if (!roomCode.trim()) { setError(t('請輸入房號', 'Enter room code')); return; }
    setLoading(true);
    const code = roomCode.toUpperCase();
    const snapshot = await get(ref(db, `rooms/${code}`));
    const data = snapshot.val() as Room | null;

    if (!data) { setError(t('找不到房間', 'Room not found')); setLoading(false); return; }
    if (data.status !== 'waiting') { setError(t('遊戲已開始', 'Game already started')); setLoading(false); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= data.maxPlayers) { setError(t('房間已滿', 'Room is full')); setLoading(false); return; }

    const newPlayer: Player = { id: playerId, name: playerName.trim(), score: 0, isHost: false, ready: true };
    await update(ref(db, `rooms/${code}/players`), { [playerId]: newPlayer });
    setMyRoomCode(code);
    setIsHost(false);
    setView('waiting');
    setLoading(false);
  };

  const handleStartGame = async () => {
    if (!room) return;
    const playerCount = Object.keys(room.players || {}).length;
    if (playerCount < 2) { setError(t('至少需要2位玩家', 'Need at least 2 players')); return; }

    // Set first question at game start
    const pool = room.mode === 'chord'
      ? ALL_CHORDS.filter(c => c.complexity === 'basic')
      : ALL_NOTES;
    const firstItem = pool[Math.floor(Math.random() * pool.length)];
    await update(ref(db, `rooms/${myRoomCode}`), {
      status: 'playing',
      currentAnswer: firstItem.name,
      questionStartTime: Date.now(),
      answers: {},
    });
  };

  const playerCount = room ? Object.keys(room.players || {}).length : 0;

  const btnBase: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: 'var(--surface-2)',
    border: '3px solid var(--border)', color: 'var(--text)', fontSize: '1rem',
    fontFamily: "'Press Start 2P', 'DotGothic16', monospace", outline: 'none',
    marginBottom: '12px', letterSpacing: '1px',
  };

  if (view === 'waiting') {
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn" onClick={handleLeave} style={{ padding: '8px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none' }}>
            {t('◀ 離開', '◀ LEAVE')}
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {t('等待玩家', 'WAITING FOR PLAYERS')}
          </span>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '3px solid var(--orange)', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('房間號碼', 'ROOM CODE')}</div>
          <div style={{ fontSize: '2.5rem', color: 'var(--orange)', letterSpacing: '8px', fontWeight: 'bold' }}>{myRoomCode}</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {t('將此號碼分享給其他玩家', 'Share this code with other players')}
          </div>
        </div>

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'left' }}>
          {t('玩家列表', 'PLAYERS')} ({playerCount}/{room?.maxPlayers})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {room && Object.values(room.players).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface-2)', border: '2px solid var(--border)' }}>
              <span style={{ fontSize: '1rem' }}>{p.isHost ? '👑' : '👤'}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)', flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--success)' }}>✓ {t('已加入', 'JOINED')}</span>
            </div>
          ))}
          {room && Array.from({ length: (room.maxPlayers - playerCount) }).map((_, i) => (
            <div key={i} style={{ padding: '12px', background: 'var(--surface-2)', border: '2px dashed var(--border)', textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              {t('等待玩家加入...', 'Waiting for player...')}
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '16px', padding: '10px', background: 'var(--surface-2)', border: '2px solid var(--border)' }}>
          <div>🎵 {t('模式', 'MODE')}: {room?.mode === 'chord' ? t('猜和弦', 'CHORD QUIZ') : t('測音感', 'NOTE QUIZ')}</div>
          <div style={{ marginTop: '6px' }}>🏆 {t('目標分數', 'TARGET')}: {room?.targetScore}</div>
        </div>

        {isHost && (
          <>
            {error && <p style={{ color: 'var(--error)', fontSize: '0.7rem', marginBottom: '12px' }}>{error}</p>}
            <button className="btn btn-primary" style={btnBase} onClick={handleStartGame} disabled={playerCount < 2}>
              {playerCount < 2 ? t('等待更多玩家...', 'Waiting for players...') : t('🚀 開始遊戲！', '🚀 START GAME!')}
            </button>
          </>
        )}
        {!isHost && (
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {t('等待房主開始遊戲...', 'Waiting for host to start...')}
          </p>
        )}
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="card">
        <button className="btn" onClick={() => { setView('menu'); setError(''); }} style={{ padding: '8px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', marginBottom: '20px', display: 'block' }}>
          {t('◀ 返回', '◀ BACK')}
        </button>
        <h2 className="title" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>{t('建立房間', 'CREATE ROOM')}</h2>

        <input style={inputStyle} placeholder={t('你的暱稱', 'Your Nickname')} value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={12} />

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'left' }}>{t('遊戲模式', 'GAME MODE')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {(['chord', 'note'] as MultiplayerMode[]).map(m => (
            <button key={m} className={`btn ${mode === m ? 'btn-primary' : 'btn-option'}`} onClick={() => setMode(m)}>
              {m === 'chord' ? (t('🎵 猜和弦', '🎵 CHORD')) : (t('🎵 測音感', '🎵 NOTE'))}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'left' }}>{t('玩家人數', 'PLAYERS')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[2, 3, 4].map(n => (
            <button key={n} className={`btn ${maxPlayers === n ? 'btn-primary' : 'btn-option'}`} onClick={() => setMaxPlayers(n)}>{n}</button>
          ))}
        </div>

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'left' }}>{t('目標分數', 'TARGET SCORE')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {[500, 1000, 1500].map(n => (
            <button key={n} className={`btn ${targetScore === n ? 'btn-primary' : 'btn-option'}`} onClick={() => setTargetScore(n)}>{n}</button>
          ))}
        </div>

        {error && <p style={{ color: 'var(--error)', fontSize: '0.7rem', marginBottom: '12px' }}>{error}</p>}
        <button className="btn btn-primary" style={btnBase} onClick={handleCreateRoom} disabled={loading}>
          {loading ? t('建立中...', 'Creating...') : t('🏠 建立房間', '🏠 CREATE ROOM')}
        </button>
      </div>
    );
  }

  if (view === 'join') {
    return (
      <div className="card">
        <button className="btn" onClick={() => { setView('menu'); setError(''); }} style={{ padding: '8px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', marginBottom: '20px', display: 'block' }}>
          {t('◀ 返回', '◀ BACK')}
        </button>
        <h2 className="title" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>{t('加入房間', 'JOIN ROOM')}</h2>
        <input style={inputStyle} placeholder={t('你的暱稱', 'Your Nickname')} value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={12} />
        <input style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '6px', textAlign: 'center', fontSize: '1.2rem' }} placeholder={t('輸入房號', 'ROOM CODE')} value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={4} />
        {error && <p style={{ color: 'var(--error)', fontSize: '0.7rem', marginBottom: '12px' }}>{error}</p>}
        <button className="btn btn-primary" style={btnBase} onClick={handleJoinRoom} disabled={loading}>
          {loading ? t('加入中...', 'Joining...') : t('🚪 加入房間', '🚪 JOIN ROOM')}
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <button className="btn" onClick={onBack} style={{ padding: '8px 12px', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', marginBottom: '8px', display: 'block' }}>
        {t('◀ 返回主頁', '◀ HOME')}
      </button>
      <h2 className="title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>🌐 {t('多人對戰', 'MULTIPLAYER')}</h2>
      <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 2 }}>
        {t('與朋友即時對戰，搶答奪分！', 'Real-time battles with friends!')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button className="btn btn-primary" style={btnBase} onClick={() => { setView('create'); setError(''); }}>
          🏠 {t('建立房間', 'CREATE ROOM')}
        </button>
        <button
          className="btn btn-primary"
          style={{ ...btnBase, background: 'var(--surface-2)', borderColor: 'var(--blue)', boxShadow: '4px 4px 0 var(--blue-shadow)' }}
          onClick={() => { setView('join'); setError(''); }}
        >
          🚪 {t('加入房間', 'JOIN ROOM')}
        </button>
      </div>
    </div>
  );
};
