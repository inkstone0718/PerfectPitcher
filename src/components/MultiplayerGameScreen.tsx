import React, { useState, useEffect, useRef } from 'react';
import { db } from '../utils/firebase';
import { ref, update, onValue, off } from 'firebase/database';
import { ALL_CHORDS } from '../utils/chords';
import { ALL_NOTES } from '../utils/notes';
import { initAudio, playChord, playNote } from '../utils/audioEngine';
import type { Language } from '../App';
import type { Room } from './MultiplayerLobbyScreen';

type GameItem = { name: string; notes: string[] };

type Props = {
  language: Language;
  roomId: string;
  playerId: string;
  playerName: string;
  onBack: () => void;
  onBackToRoom: () => void;
};

const CORRECT_BASE = [100, 75, 50, 25];
const SOLO_CORRECT_BONUS = 100;

export const MultiplayerGameScreen: React.FC<Props> = ({ language, roomId, playerId, onBack, onBackToRoom }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [options, setOptions] = useState<GameItem[]>([]);
  const [hoveredAnswer, setHoveredAnswer] = useState<string | null>(null);   // step 1: hover/select
  const [confirmedAnswer, setConfirmedAnswer] = useState<string | null>(null); // step 2: confirmed
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasConfirmedRef = useRef(false);
  const hoveredRef = useRef<string | null>(null); // keep in sync for timer callback
  const prevQuestionRef = useRef<string>('');

  const t = (zh: string, en: string) => language === 'zh' ? zh : en;
  const isHost = room?.host === playerId;

  // Init audio on mount (user already clicked to get here)
  useEffect(() => {
    initAudio();
  }, []);

  // Watch room
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as Room | null;
      if (!data) { onBack(); return; }
      setRoom(data);
      if (data.status === 'finished') {
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    });
    return () => off(roomRef);
  }, [roomId, onBack]);

  // Generate options when currentAnswer changes
  useEffect(() => {
    if (!room?.currentAnswer || !room?.mode) return;
    // Prevent re-triggering for the same question
    const questionKey = `${room.currentAnswer}_${room.questionStartTime}`;
    if (questionKey === prevQuestionRef.current) return;
    prevQuestionRef.current = questionKey;

    hasConfirmedRef.current = false;
    hoveredRef.current = null;
    setHoveredAnswer(null);
    setConfirmedAnswer(null);
    setRevealed(false);

    const correctName = room.currentAnswer;

    // Find correct item from ALL items to guarantee we get it
    const allPool = room.mode === 'chord' ? ALL_CHORDS.filter(c => c.complexity === 'basic') : ALL_NOTES;
    const correctItem = allPool.find(c => c.name === correctName) || { name: correctName, notes: [] };

    // Get 3 wrong options (guaranteed different from correct)
    let wrongOptions: GameItem[];
    if (room.mode === 'chord') {
      const pool = ALL_CHORDS.filter(c => c.complexity === 'basic' && c.name !== correctName);
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      wrongOptions = shuffled.slice(0, 3);
    } else {
      const pool = ALL_NOTES.filter(n => n.name !== correctName);
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      wrongOptions = shuffled.slice(0, 3);
    }

    const opts = [...wrongOptions, correctItem].sort(() => 0.5 - Math.random());
    setOptions(opts);

    // Play the question sound
    setTimeout(() => {
      if (room.mode === 'chord') playChord(correctItem.notes);
      else playNote(correctItem.notes[0]);
    }, 600);

    // Reset timer
    setTimeLeft(15);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-confirm hovered answer when time runs out
          if (!hasConfirmedRef.current && hoveredRef.current) {
            autoConfirm(hoveredRef.current);
          }
          setRevealed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [room?.currentAnswer, room?.questionStartTime]);

  // Auto-confirm function (called by timer)
  const autoConfirm = async (answerName: string) => {
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;
    setConfirmedAnswer(answerName);
    await update(ref(db, `rooms/${roomId}/answers`), {
      [playerId]: { answer: answerName, time: Date.now() - (room?.questionStartTime ?? 0) },
    });
  };

  // Watch answers to trigger reveal when all answered
  useEffect(() => {
    if (!room?.answers || !room?.players) return;
    const playerIds = Object.keys(room.players);
    const answerIds = Object.keys(room.answers);
    if (answerIds.length >= playerIds.length) {
      setRevealed(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [room?.answers]);

  // Host: process round after reveal
  useEffect(() => {
    if (!revealed || !isHost || !room) return;
    const processTimer = setTimeout(async () => {
      await processRound();
    }, 3000);
    return () => clearTimeout(processTimer);
  }, [revealed]);

  const processRound = async () => {
    if (!room) return;
    const { answers, players, currentAnswer, currentQuestion, targetScore } = room;

    const correctAnswers = Object.entries(answers || {})
      .filter(([, ans]) => ans.answer === currentAnswer)
      .sort((a, b) => a[1].time - b[1].time);

    const wrongAnswers = Object.entries(answers || {})
      .filter(([, ans]) => ans.answer !== currentAnswer);

    const totalPlayers = Object.keys(players).length;
    const scoreUpdates: Record<string, number> = {};

    if (correctAnswers.length === totalPlayers && totalPlayers >= 2) {
      // Tie: all players answered correctly → everyone gets flat +100
      correctAnswers.forEach(([pid]) => {
        scoreUpdates[pid] = (players[pid]?.score ?? 0) + 100;
      });
    } else {
      correctAnswers.forEach(([pid], index) => {
        const base = CORRECT_BASE[index] ?? 0;
        const soloBonus = correctAnswers.length === 1 ? SOLO_CORRECT_BONUS : 0;
        const halfBonus = correctAnswers.length === 2 ? 50 : 0;
        scoreUpdates[pid] = (players[pid]?.score ?? 0) + base + soloBonus + halfBonus;
      });
    }
    wrongAnswers.forEach(([pid]) => {
      scoreUpdates[pid] = players[pid]?.score ?? 0;
    });

    const gameOver = Object.values(scoreUpdates).some(s => s >= targetScore);

    const playerUpdates: Record<string, unknown> = {};
    Object.entries(scoreUpdates).forEach(([pid, score]) => {
      playerUpdates[`players/${pid}/score`] = score;
    });

    if (gameOver) {
      await update(ref(db, `rooms/${roomId}`), { ...playerUpdates, status: 'finished', answers: {} });
    } else {
      const pool = room.mode === 'chord'
        ? ALL_CHORDS.filter(c => c.complexity === 'basic')
        : ALL_NOTES;
      const nextItem = pool[Math.floor(Math.random() * pool.length)];
      await update(ref(db, `rooms/${roomId}`), {
        ...playerUpdates,
        currentQuestion: currentQuestion + 1,
        currentAnswer: nextItem.name,
        questionStartTime: Date.now(),
        answers: {},
      });
    }
  };

  // Step 1: Select (hover/first tap)
  const handleSelect = (item: GameItem) => {
    if (hasConfirmedRef.current || revealed) return;
    if (hoveredAnswer === item.name) {
      // Step 2: Confirm (second tap on same item)
      handleConfirm(item);
    } else {
      setHoveredAnswer(item.name);
      hoveredRef.current = item.name;
    }
  };

  // Step 2: Confirm
  const handleConfirm = async (item: GameItem) => {
    if (hasConfirmedRef.current || revealed) return;
    hasConfirmedRef.current = true;
    setConfirmedAnswer(item.name);
    await update(ref(db, `rooms/${roomId}/answers`), {
      [playerId]: { answer: item.name, time: Date.now() - (room?.questionStartTime ?? 0) },
    });
  };

  if (!room) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('連線中...', 'Connecting...')}</p>
      </div>
    );
  }

  if (isFinished) {
    const sortedPlayers = Object.values(room.players).sort((a, b) => b.score - a.score);
    const medals = ['🥇', '🥈', '🥉', '4️⃣'];
    return (
      <div className="card">
        <h2 className="title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>🏆 {t('遊戲結束', 'GAME OVER')}</h2>
        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('最終排名', 'FINAL RANKINGS')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
              background: i === 0 ? 'var(--orange)' : 'var(--surface-2)',
              border: `2px solid ${i === 0 ? '#f0ece0' : 'var(--border)'}`,
              color: i === 0 ? '#0a0a0a' : 'var(--text)',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{medals[i]}</span>
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{p.name} {p.id === playerId ? t('(你)', '(You)') : ''}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{p.score}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onBackToRoom} style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
            {t('🔄 返回房間', '🔄 BACK TO ROOM')}
          </button>
          <button className="btn" onClick={onBack} style={{ width: '100%', justifyContent: 'center', display: 'flex', background: 'transparent', color: 'var(--text-muted)', border: '2px solid var(--border)', boxShadow: 'none' }}>
            {t('🏠 返回主頁', '🏠 HOME')}
          </button>
        </div>
      </div>
    );
  }


  const correctAnswersThisRound = revealed
    ? Object.entries(room.answers || {}).filter(([, ans]) => ans.answer === room.currentAnswer).sort((a, b) => a[1].time - b[1].time)
    : [];

  return (
    <div className="card" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          🏆 {t('目標', 'TARGET')}: {room.targetScore}
        </div>
        <div style={{ fontSize: '1rem', color: timeLeft <= 5 ? 'var(--error)' : 'var(--orange)', fontWeight: 'bold' }}>
          ⏱ {timeLeft}s
        </div>
      </div>

      {/* Score bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Object.values(room.players).sort((a,b) => b.score - a.score).map(p => (
          <div key={p.id} style={{ flex: 1, minWidth: '80px', background: 'var(--surface-2)', border: `2px solid ${p.id === playerId ? 'var(--orange)' : 'var(--border)'}`, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ fontSize: '0.9rem', color: p.id === playerId ? 'var(--orange)' : 'var(--text)', fontWeight: 'bold' }}>{p.score}</div>
            <div style={{ height: '4px', background: 'var(--border)', marginTop: '4px' }}>
              <div style={{ height: '100%', width: `${(p.score / (room.targetScore)) * 100}%`, background: p.id === playerId ? 'var(--orange)' : 'var(--blue)', transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      {!revealed && (
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px' }}>
          {confirmedAnswer
            ? t('✓ 已確認答案，等待其他玩家...', '✓ Confirmed! Waiting for others...')
            : hoveredAnswer
              ? t('再按一次確認答案', 'Tap again to confirm')
              : t('選擇你的答案', 'Select your answer')
          }
          <span style={{ marginLeft: '12px', opacity: 0.5 }}>
            ({Object.keys(room.answers || {}).length}/{Object.keys(room.players).length})
          </span>
        </div>
      )}

      {/* Play button */}
      <button className="btn btn-play" onClick={() => {
        const item = options.find(o => o.name === room.currentAnswer);
        if (item) {
          initAudio().then(() => {
            if (room.mode === 'chord') playChord(item.notes);
            else playNote(item.notes[0]);
          });
        }
      }} style={{ margin: '0 auto 20px' }}>
        ▶
      </button>

      {/* Options */}
      <div className="options-grid">
        {options.map((item) => {
          let cls = 'btn btn-option';
          let inlineStyle: React.CSSProperties | undefined = undefined;

          if (revealed) {
            if (item.name === room.currentAnswer) cls += ' correct';
            else if (item.name === confirmedAnswer) cls += ' wrong';
          } else if (item.name === confirmedAnswer) {
            // Confirmed: solid orange with lock icon
            cls = 'btn';
            inlineStyle = {
              background: 'var(--orange)',
              borderColor: '#f0ece0',
              color: '#0a0a0a',
              boxShadow: '4px 4px 0 #7a3f00',
              cursor: 'default',
            };
          } else if (!confirmedAnswer && item.name === hoveredAnswer) {
            // Selected but not confirmed: blue with pulse
            cls = 'btn';
            inlineStyle = {
              background: 'var(--blue)',
              borderColor: 'var(--white)',
              color: 'var(--white)',
              boxShadow: '4px 4px 0 var(--blue-shadow)',
              animation: 'pixel-pulse 0.8s steps(1) infinite',
            };
          }

          const isHovered = !revealed && !confirmedAnswer && item.name === hoveredAnswer;
          const isConfirmed = !revealed && item.name === confirmedAnswer;

          return (
            <button
              key={item.name}
              className={cls}
              onClick={() => handleSelect(item)}
              disabled={!!confirmedAnswer || revealed}
              style={inlineStyle}
            >
              {item.name}
              {isHovered && <span style={{ display: 'block', fontSize: '0.45rem', marginTop: '4px', opacity: 0.8 }}>
                {t('再按確認', 'TAP CONFIRM')}
              </span>}
              {isConfirmed && <span style={{ display: 'block', fontSize: '0.45rem', marginTop: '4px' }}>
                {t('🔒 已鎖定', '🔒 LOCKED')}
              </span>}
            </button>
          );
        })}
      </div>

      {/* Reveal results */}
      {revealed && correctAnswersThisRound.length > 0 && (
        <>
          {correctAnswersThisRound.length === 1 && (
            <div className="solo-banner">
              ⭐ {t(`玩家：${room.players[correctAnswersThisRound[0][0]]?.name} 獨領風騷！`, `Player ${room.players[correctAnswersThisRound[0][0]]?.name} dominated!`)} ⭐
            </div>
          )}
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-2)', border: '2px solid var(--success)', fontSize: '0.6rem' }}>
            <div style={{ color: 'var(--success)', marginBottom: '8px' }}>✓ {t('答對的玩家', 'CORRECT PLAYERS')}:</div>
            {correctAnswersThisRound.map(([pid], i) => (
              <div key={pid} style={{ color: 'var(--text)', marginBottom: '4px' }}>
                {['🥇','🥈','🥉','4️⃣'][i]} {room.players[pid]?.name} +{CORRECT_BASE[i]}{i === 0 && correctAnswersThisRound.length === 1 ? ` (+${SOLO_CORRECT_BONUS} SOLO!)` : ''}
              </div>
            ))}
          </div>
        </>
      )}
      {revealed && correctAnswersThisRound.length === 0 && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-2)', border: '2px solid var(--error)', fontSize: '0.65rem', color: 'var(--error)', textAlign: 'center' }}>
          {t('沒有人答對！', 'Nobody got it right!')}
        </div>
      )}
    </div>
  );
};
