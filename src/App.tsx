import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ChallengeSetupScreen } from './components/ChallengeSetupScreen';
import { ChallengeGameScreen } from './components/ChallengeGameScreen';
import { GuessSetupScreen } from './components/GuessSetupScreen';
import { MultiplayerLobbyScreen } from './components/MultiplayerLobbyScreen';
import { MultiplayerGameScreen } from './components/MultiplayerGameScreen';
import { type ChallengeConfig } from './utils/challengeEngine';
import { initAudio } from './utils/audioEngine';
import { auth, googleProvider } from './utils/firebase';
import { getSoloModeKey } from './utils/playerStats';
import './App.css';

export type GameMode = 'chord' | 'note' | 'challenge';
export type Language = 'zh' | 'en';
export type Theme = 'dark' | 'light';
type GameState = 'home' | 'playing' | 'result' | 'challengeSetup' | 'guessSetup' | 'settings' | 'multiplayerLobby' | 'multiplayerGame';

function App() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'zh');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);
  const [gameMode, setGameMode] = useState<GameMode>('chord');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [challengeConfig, setChallengeConfig] = useState<ChallengeConfig | null>(null);
  const [challengeTime, setChallengeTime] = useState(0);
  const [includeAdvancedChords, setIncludeAdvancedChords] = useState(false);
  const [multiplayerRoomId, setMultiplayerRoomId] = useState('');
  const [multiplayerPlayerId, setMultiplayerPlayerId] = useState('');
  const [multiplayerPlayerName, setMultiplayerPlayerName] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleSignIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleStart = async (mode: GameMode) => {
    await initAudio(); // Initialize Web Audio API on user gesture
    setGameMode(mode);
    if (mode === 'chord') {
      setGameState('guessSetup');
    } else {
      setGameState('playing');
    }
  };

  const handleStartGuess = (includeAdvanced: boolean) => {
    setIncludeAdvancedChords(includeAdvanced);
    setGameState('playing');
  };

  const handleStartChallengeSetup = () => {
    setGameState('challengeSetup');
  };

  const handleStartChallenge = (config: ChallengeConfig) => {
    setChallengeConfig(config);
    setGameMode('challenge');
    setGameState('playing');
  };

  const handleGameOver = (finalScore: number, total: number, timeMs?: number) => {
    setScore(finalScore);
    setTotalQuestions(total);
    if (timeMs !== undefined) setChallengeTime(timeMs);
    else setChallengeTime(0);
    setGameState('result');
  };

  const handleRestart = () => {
    setGameState('playing');
  };

  const handleHome = () => {
    setGameState('home');
  };

  const handleOpenSettings = () => {
    setGameState('settings');
  };

  const handleStartMultiplayer = () => {
    setGameState('multiplayerLobby');
  };

  const handleMultiplayerGameStart = (roomId: string, playerId: string, playerName: string) => {
    setMultiplayerRoomId(roomId);
    setMultiplayerPlayerId(playerId);
    setMultiplayerPlayerName(playerName);
    setGameState('multiplayerGame');
  };

  const handleBackToRoom = () => {
    setGameState('multiplayerLobby');
  };

  return (
    <div className="app-container">
      {gameState === 'home' && <HomeScreen language={language} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} onStart={handleStart} onStartChallenge={handleStartChallengeSetup} onStartMultiplayer={handleStartMultiplayer} onOpenSettings={handleOpenSettings} />}
      {gameState === 'settings' && <SettingsScreen language={language} theme={theme} onLanguageChange={setLanguage} onThemeChange={setTheme} onBack={handleHome} />}
      {gameState === 'guessSetup' && <GuessSetupScreen language={language} mode={gameMode as 'chord' | 'note'} onStart={handleStartGuess} onBack={handleHome} />}
      {gameState === 'challengeSetup' && <ChallengeSetupScreen language={language} onStart={handleStartChallenge} onBack={handleHome} />}
      {gameState === 'playing' && gameMode !== 'challenge' && <GameScreen language={language} mode={gameMode} onGameOver={handleGameOver} onBack={handleHome} includeAdvanced={includeAdvancedChords} />}
      {gameState === 'playing' && gameMode === 'challenge' && challengeConfig && <ChallengeGameScreen language={language} config={challengeConfig} onGameOver={handleGameOver} onBack={handleHome} />}
      {gameState === 'result' && <ResultScreen language={language} user={user} modeKey={getSoloModeKey(gameMode, includeAdvancedChords)} score={score} total={totalQuestions} timeMs={challengeTime} onSignIn={handleSignIn} onRestart={handleRestart} onHome={handleHome} />}
      {gameState === 'multiplayerLobby' && <MultiplayerLobbyScreen language={language} onGameStart={handleMultiplayerGameStart} onBack={handleHome} />}
      {gameState === 'multiplayerGame' && <MultiplayerGameScreen language={language} roomId={multiplayerRoomId} playerId={multiplayerPlayerId} playerName={multiplayerPlayerName} onBack={handleHome} onBackToRoom={handleBackToRoom} />}
    </div>
  );
}

export default App;
