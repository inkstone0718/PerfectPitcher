import React from 'react';
import { type Language, type Theme } from '../App';

type Props = {
  language: Language;
  theme: Theme;
  onLanguageChange: (lang: Language) => void;
  onThemeChange: (theme: Theme) => void;
  onBack: () => void;
};

export const SettingsScreen: React.FC<Props> = ({ language, theme, onLanguageChange, onThemeChange, onBack }) => {
  return (
    <div className="card">
      <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '40px' }}>
         {language === 'zh' ? '⚙️ 設定' : '⚙️ SETTINGS'}
      </h2>

      <div style={{ marginBottom: '32px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1rem', color: '#888877', marginBottom: '16px' }}>
          {language === 'zh' ? '語言 / LANGUAGE' : 'LANGUAGE'}
        </h3>
        <div className="options-grid">
          <button 
            className={`btn-option ${language === 'zh' ? 'correct' : ''}`}
            onClick={() => onLanguageChange('zh')}
          >
            中文
          </button>
          <button 
            className={`btn-option ${language === 'en' ? 'correct' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            ENGLISH
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '48px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1rem', color: '#888877', marginBottom: '16px' }}>
          {language === 'zh' ? '外觀 / THEME' : 'THEME'}
        </h3>
        <div className="options-grid">
          <button 
            className={`btn-option ${theme === 'dark' ? 'correct' : ''}`}
            onClick={() => onThemeChange('dark')}
          >
            {language === 'zh' ? '深色' : 'DARK'}
          </button>
          <button 
            className={`btn-option ${theme === 'light' ? 'correct' : ''}`}
            onClick={() => onThemeChange('light')}
          >
            {language === 'zh' ? '淺色' : 'LIGHT'}
          </button>
        </div>
      </div>

      <button className="btn" style={{ background: 'transparent', color: '#888877', boxShadow: 'none', border: 'none' }} onClick={onBack}>
        {language === 'zh' ? '◀ 返回首頁' : '◀ BACK TO MENU'}
      </button>
    </div>
  );
};
