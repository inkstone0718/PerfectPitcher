import React, { useState } from 'react';
import { Settings, Play } from 'lucide-react';
import { type ChallengeConfig } from '../utils/challengeEngine';
import { type Language } from '../App';

const ROOTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const QUALITIES = ['Major', 'Minor', 'maj7', 'm7', '7'];

type Props = {
  language: Language;
  onStart: (config: ChallengeConfig) => void;
  onBack: () => void;
};

export const ChallengeSetupScreen: React.FC<Props> = ({ language, onStart, onBack }) => {
  const [selectedRoots, setSelectedRoots] = useState<string[]>(['C', 'G']);
  const [selectedQualities, setSelectedQualities] = useState<string[]>(['Major']);
  const [questionCount, setQuestionCount] = useState<number>(5);

  const toggleRoot = (root: string) => {
    setSelectedRoots(prev => 
      prev.includes(root) ? prev.filter(r => r !== root) : [...prev, root]
    );
  };

  const toggleAllRoots = () => {
    if (selectedRoots.length === ROOTS.length) {
      setSelectedRoots([]);
    } else {
      setSelectedRoots([...ROOTS]);
    }
  };

  const toggleQuality = (quality: string) => {
    setSelectedQualities(prev => 
      prev.includes(quality) ? prev.filter(q => q !== quality) : [...prev, quality]
    );
  };

  const toggleAllQualities = () => {
    if (selectedQualities.length === QUALITIES.length) {
      setSelectedQualities([]);
    } else {
      setSelectedQualities([...QUALITIES]);
    }
  };

  const handleStart = () => {
    if (selectedRoots.length === 0 || selectedQualities.length === 0) {
      alert(language === 'zh' ? "請至少選擇一個根音與一個調性！" : "Please select at least one root and one quality!");
      return;
    }
    onStart({ roots: selectedRoots, qualities: selectedQualities, questionCount });
  };

  return (
    <div className="card" style={{ maxWidth: '600px', position: 'relative' }}>
      <button className="btn" style={{ position: 'absolute', top: '15px', left: '15px', padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none' }} onClick={onBack}>
        {language === 'zh' ? '◀ 返回' : '◀ BACK'}
      </button>

      <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '20px', marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Settings size={28} style={{ marginRight: '10px' }} />
        {language === 'zh' ? '和弦挑戰設定' : 'CHALLENGE SETUP'}
      </h2>

      <div style={{ textAlign: 'left', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {language === 'zh' ? '根音選擇 (A~G)' : 'ROOT NOTE (A~G)'}
          </h3>
          <button className="btn" style={{ padding: '8px 12px', fontSize: '0.7rem', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }} onClick={toggleAllRoots}>
            {selectedRoots.length === ROOTS.length ? (language === 'zh' ? '全不選' : 'NONE') : (language === 'zh' ? '全選' : 'ALL')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {ROOTS.map(root => (
            <button 
              key={root} 
              className={`btn btn-option ${selectedRoots.includes(root) ? 'correct' : ''}`}
              style={{ padding: '8px 15px', minWidth: '40px' }}
              onClick={() => toggleRoot(root)}
            >
              {root}
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {language === 'zh' ? '調性選擇' : 'QUALITY'}
          </h3>
          <button className="btn" style={{ padding: '8px 12px', fontSize: '0.7rem', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }} onClick={toggleAllQualities}>
            {selectedQualities.length === QUALITIES.length ? (language === 'zh' ? '全不選' : 'NONE') : (language === 'zh' ? '全選' : 'ALL')}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {QUALITIES.map(quality => (
            <button 
              key={quality} 
              className={`btn btn-option ${selectedQualities.includes(quality) ? 'correct' : ''}`}
              onClick={() => toggleQuality(quality)}
            >
              {quality === 'Major' 
                ? (language === 'zh' ? '大調 (Major)' : 'MAJOR') 
                : quality === 'Minor' 
                  ? (language === 'zh' ? '小調 (Minor)' : 'MINOR') 
                  : quality}
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {language === 'zh' ? '和弦數量' : 'QUESTIONS'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={questionCount} 
            onChange={(e) => setQuestionCount(Number(e.target.value))} 
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '40px', textAlign: 'center', color: 'var(--primary)' }}>
            {questionCount}
          </span>
        </div>
      </div>

      <button 
        className="btn btn-play" 
        style={{ width: '100%', height: 'auto', fontSize: '1.2rem', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
        onClick={handleStart}
      >
        <Play size={24} style={{ marginRight: '10px' }} />
        {language === 'zh' ? '開始挑戰' : 'START CHALLENGE'}
      </button>
    </div>
  );
};
