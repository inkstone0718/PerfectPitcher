import React, { useState } from 'react';
import { Settings, Play } from 'lucide-react';
import { type Language } from '../App';

type Props = {
  language: Language;
  mode: 'chord' | 'note';
  onStart: (includeAdvanced: boolean) => void;
  onBack: () => void;
};

export const GuessSetupScreen: React.FC<Props> = ({ language, mode, onStart, onBack }) => {
  const [includeAdvanced, setIncludeAdvanced] = useState(false);

  return (
    <div className="card" style={{ maxWidth: '600px', position: 'relative' }}>
      <button className="btn" style={{ position: 'absolute', top: '15px', left: '15px', padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none' }} onClick={onBack}>
        {language === 'zh' ? '◀ 返回' : '◀ BACK'}
      </button>

      <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '20px', marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Settings size={28} style={{ marginRight: '10px' }} />
        {mode === 'chord' 
          ? (language === 'zh' ? '猜和弦設定' : 'CHORD SETUP') 
          : (language === 'zh' ? '聽音設定' : 'NOTE SETUP')}
      </h2>

      <div style={{ textAlign: 'left', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {language === 'zh' ? '難度選擇' : 'DIFFICULTY'}
        </h3>
        
        <button 
          className={`btn ${includeAdvanced ? 'btn-primary' : 'btn-option'}`}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left', padding: '20px' }}
          onClick={() => setIncludeAdvanced(!includeAdvanced)}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '1rem' }}>
              {language === 'zh' ? '包含七和弦 (maj7, m7, 7)' : 'INCLUDE 7TH CHORDS'}
            </span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: '1.6' }}>
              {language === 'zh' ? '加入進階和弦，大幅提升聽力挑戰難度' : 'Adds advanced chords for a greater challenge'}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', marginLeft: '10px' }}>{includeAdvanced ? '☑' : '☐'}</div>
        </button>
      </div>

      <button className="btn btn-play" style={{ width: '100%', height: 'auto', fontSize: '1.2rem', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => onStart(includeAdvanced)}>
        <Play size={24} style={{ marginRight: '10px' }} />
        {language === 'zh' ? '開始遊戲' : 'START GAME'}
      </button>
    </div>
  );
};
