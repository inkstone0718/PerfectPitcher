import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playNote } from '../utils/audioEngine';
import { ALL_CHORDS } from '../utils/chords';
import { type ChallengeConfig, type TargetChord, generateChallengeChords, startMicAnalysis, stopMicAnalysis, calculateCosineSimilarity, getOppositeTemplate } from '../utils/challengeEngine';
import { type Language } from '../App';

type Props = {
  language: Language;
  config: ChallengeConfig;
  onGameOver: (score: number, total: number, timeMs: number) => void;
  onBack: () => void;
};

const THRESHOLD = 0.70;
const REQUIRED_FRAMES = 10; // ~500ms 

type GamePhase = 'preparing' | 'playing';

export const ChallengeGameScreen: React.FC<Props> = ({ language, config, onGameOver, onBack }) => {
  const [phase, setPhase] = useState<GamePhase>('preparing');
  const [countdown, setCountdown] = useState(3);
  
  const [isMicActive, setIsMicActive] = useState(false);
  const [chords, setChords] = useState<TargetChord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [similarity, setSimilarity] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [micError, setMicError] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  
  const [chromaBars, setChromaBars] = useState<number[]>(new Array(12).fill(0));
  
  const successFramesRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const smoothedChromaRef = useRef<number[]>(new Array(12).fill(0));

  useEffect(() => {
    const generated = generateChallengeChords(config);
    if (generated.length === 0) {
      onBack();
      return;
    }
    setChords(generated);

    let currentCount = 3;
    countdownTimerRef.current = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      if (currentCount <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        
        // Ensure similarity and mic data is zeroed out before starting
        smoothedChromaRef.current.fill(0);
        setChromaBars(new Array(12).fill(0));
        setSimilarity(0);
        
        setPhase('playing');
        
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
          setElapsedMs(Date.now() - startTimeRef.current);
        }, 100);
      }
    }, 1000);

    let isMounted = true;

    const initMic = async () => {
      const success = await startMicAnalysis((features) => {
        if (!isMounted) return;
        
        // RMS Noise Gate
        if (features.rms < 0.01) {
          // Fade out signal when quiet
          for (let i = 0; i < 12; i++) {
            smoothedChromaRef.current[i] *= 0.5;
          }
        } else {
          // Temporal Smoothing
          for (let i = 0; i < 12; i++) {
            smoothedChromaRef.current[i] = smoothedChromaRef.current[i] * 0.7 + features.chroma[i] * 0.3;
          }
        }
        
        setChromaBars([...smoothedChromaRef.current]);
      });
      if (isMounted) {
        setIsMicActive(success);
        setMicError(!success);
      }
    };
    initMic();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      stopMicAnalysis();
    };
  }, []);

  const targetRef = useRef<TargetChord | null>(null);
  useEffect(() => {
    targetRef.current = chords[currentIndex] || null;
    successFramesRef.current = 0;
  }, [currentIndex, chords]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (!targetRef.current) return;
    if (showSuccessAnimation) return;
    
    // If the guitar is silent (chroma bars faded out), reset similarity
    const totalEnergy = chromaBars.reduce((a, b) => a + b, 0);
    if (totalEnergy < 0.1) {
      setSimilarity(0);
      setWarningMessage(null);
      return;
    }
    
    const sim = calculateCosineSimilarity(chromaBars, targetRef.current.template);
    const oppositeTemplate = getOppositeTemplate(targetRef.current.name);
    const oppositeSim = calculateCosineSimilarity(chromaBars, oppositeTemplate);
    
    setSimilarity(sim);
    
    if (sim >= THRESHOLD || oppositeSim >= THRESHOLD) {
      if (oppositeSim > sim + 0.05) {
        const wrongTypeZh = targetRef.current.name.includes('Major') ? '小調 (Minor)' : '大調 (Major)';
        const wrongTypeEn = targetRef.current.name.includes('Major') ? 'Minor' : 'Major';
        setWarningMessage(language === 'zh' ? `⚠️ 你是不是彈成 ${wrongTypeZh} 了？` : `⚠️ Did you play ${wrongTypeEn} instead?`);
      } else {
        setWarningMessage(null);
      }
    } else {
      setWarningMessage(null);
    }
    
    const isQualityCorrect = sim > oppositeSim;

    if (sim >= THRESHOLD && isQualityCorrect) {
      successFramesRef.current += 1;
      if (successFramesRef.current >= REQUIRED_FRAMES) {
        successFramesRef.current = 0;
        
        setShowSuccessAnimation(true);
        setSimilarity(0);
        setWarningMessage(null);
        
        // Fire confetti from both edges
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#ff9a9e', '#a8e6cf', '#a1c4fd', '#fecfef']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#ff9a9e', '#a8e6cf', '#a1c4fd', '#fecfef']
        });
        
        if (currentIndex < chords.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          stopMicAnalysis();
          onGameOver(chords.length - skippedCount, chords.length, Date.now() - startTimeRef.current);
          return;
        }

        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 500);
      }
    } else {
      successFramesRef.current = Math.max(0, successFramesRef.current - 1);
    }
  }, [chromaBars, phase, showSuccessAnimation]);

  if (chords.length === 0) return null;

  const targetChord = chords[currentIndex];
  const timeSec = (elapsedMs / 1000).toFixed(1);
  const PITCH_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const handleSkip = () => {
    setSkippedCount(s => s + 1);
    successFramesRef.current = 0;
    setSimilarity(0);
    setWarningMessage(null);
    
    if (currentIndex < chords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMicAnalysis();
      onGameOver(chords.length - (skippedCount + 1), chords.length, Date.now() - startTimeRef.current);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', width: '100%', position: 'relative', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <button className="btn" style={{ padding: '8px 10px', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', fontSize: '0.8rem' }} onClick={onBack}>
          {language === 'zh' ? '◀ 放棄' : '◀ QUIT'}
        </button>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '1rem', color: 'var(--primary)' }}>
            {phase === 'playing' ? `${currentIndex + 1} / ${chords.length}` : '---'}
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text)' }}>
            ⏱️ {phase === 'playing' ? timeSec : '0.0'}s
          </div>
          <div>
            {isMicActive ? <Mic color="var(--success)" /> : micError ? <MicOff color="var(--error)" /> : <Mic color="var(--text-muted)" />}
          </div>
        </div>
      </div>

      {phase === 'preparing' ? (
        <div style={{ textAlign: 'center', margin: '40px 0', animation: 'fadeIn 0.5s' }}>
          <AlertCircle size={40} color="#ed8936" style={{ marginBottom: '10px' }} />
          <h2 style={{ color: '#ed8936', marginBottom: '10px' }}>
            {language === 'zh' ? '準備中...' : 'GET READY...'}
          </h2>
          <p style={{ color: '#666' }}>
            {language === 'zh' ? '請拿起您的吉他！' : 'GRAB YOUR GUITAR!'}
          </p>
          <div style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '20px' }}>
            {countdown}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '40px 0', position: 'relative', overflow: 'hidden', height: '140px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>
            {language === 'zh' ? '請在吉他上彈出' : 'PLAY ON GUITAR'}
          </p>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: `translateX(calc(-130px - ${currentIndex * 260}px))`,
            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}>
            {chords.map((chord, i) => {
              const distance = Math.abs(i - currentIndex);
              
              let fontSize = '1.5rem';
              let opacity = 0;
              let color = '#a0aec0';
              let scale = 1;
              
              if (distance === 0) {
                fontSize = '2.5rem';
                opacity = 1;
                color = 'var(--primary)';
                scale = 1.1;
              } else if (distance === 1) {
                fontSize = '1.5rem';
                opacity = 0.5;
                color = i < currentIndex ? '#cbd5e0' : 'var(--accent)';
              } else if (distance === 2) {
                fontSize = '1.1rem';
                opacity = 0.2;
                color = i < currentIndex ? '#e2e8f0' : 'var(--accent-light)';
              }

              return (
                <div 
                  key={i} 
                  style={{ 
                    width: '260px', 
                    textAlign: 'center',
                    fontSize,
                    color,
                    opacity,
                    fontWeight: distance === 0 ? '900' : '600',
                    transform: `scale(${scale})`,
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    textShadow: distance === 0 ? '1px 1px 0px var(--secondary)' : 'none'
                  }}
                >
                  {chord.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>
            {warningMessage && (
              <div style={{ color: '#e53e3e', fontSize: '1rem', fontWeight: 'bold', animation: 'fadeIn 0.3s' }}>
                {warningMessage}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {language === 'zh' ? '和弦符合度' : 'MATCH'}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: similarity >= THRESHOLD ? '#48bb78' : '#666' }}>
              {(similarity * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${Math.min(100, Math.max(0, similarity) * 100)}%`, 
              backgroundColor: similarity >= THRESHOLD ? '#48bb78' : 'var(--primary)',
              transition: 'width 0.1s, background-color 0.2s'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '30px', height: '100px', alignItems: 'flex-end', overflow: 'hidden' }}>
            {chromaBars.map((val, i) => {
              const isTarget = targetChord?.template[i] === 1;
              const barColor = isTarget ? 'var(--primary)' : '#cbd5e0';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25px' }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${Math.min(80, Math.max(0, val * 100))}px`, 
                    backgroundColor: barColor,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.1s'
                  }} />
                  <span style={{ fontSize: '0.7rem', marginTop: '5px', color: isTarget ? 'var(--primary)' : '#999', fontWeight: isTarget ? 'bold' : 'normal' }}>
                    {PITCH_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            <button className="btn" style={{ padding: '8px 20px', fontSize: '1rem', backgroundColor: '#a1c4fd', color: 'white' }} onClick={() => setShowHint(true)}>
              💡 {language === 'zh' ? '提示' : 'HINT'}
            </button>
            <button className="btn" style={{ padding: '8px 20px', fontSize: '1rem', backgroundColor: '#e2e8f0', color: '#4a5568' }} onClick={handleSkip}>
              ⏭️ {language === 'zh' ? '跳過' : 'SKIP'}
            </button>
          </div>
        </div>
      )}

      {showHint && targetChord && (
        <div className="modal-overlay" onClick={() => setShowHint(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '15px' }}>
              {targetChord.name} {language === 'zh' ? '按法提示' : 'HINT'}
            </h3>
            <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '5px' }}>Guitar Tab</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d3748', letterSpacing: '8px' }}>
                {ALL_CHORDS.find(c => c.name === targetChord.name)?.tab}
              </div>
            </div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', lineHeight: '1.6', textAlign: 'left', color: '#555' }}>
              {language === 'zh' 
                ? ALL_CHORDS.find(c => c.name === targetChord.name)?.description 
                : ALL_CHORDS.find(c => c.name === targetChord.name)?.descriptionEn}
            </p>
            <h4 style={{ marginBottom: '10px', color: '#888', textAlign: 'left' }}>
              {language === 'zh' ? '組成音：' : 'NOTES:'}
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
              {ALL_CHORDS.find(c => c.name === targetChord.name)?.notes.map((note: string) => (
                <button 
                  key={note} 
                  className="btn btn-option" 
                  style={{ padding: '8px 15px', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => playNote(note)}
                >
                  <Play size={16} style={{ marginRight: '5px' }} />
                  {note}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowHint(false)}>
              {language === 'zh' ? '了解，繼續挑戰！' : 'GOT IT, CONTINUE!'}
            </button>
          </div>
        </div>
      )}

      {micError && (
        <div style={{ marginTop: '20px', color: '#e53e3e', fontSize: '0.9rem' }}>
          {language === 'zh' ? '無法存取麥克風，請確認瀏覽器權限設定。' : 'Microphone access denied. Please check browser permissions.'}
        </div>
      )}
    </div>
  );
};
