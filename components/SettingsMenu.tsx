import React, { useContext } from 'react';
import type { Theme, Language } from '../types';
import { LocalizationContext } from '../App';
import { ThemeIcon, LanguageIcon } from './Icons';

interface SettingsMenuProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ theme, setTheme, onClose }) => {
    const { t, language, setLanguage } = useContext(LocalizationContext);
    
    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        onClose();
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--ui-panel-bg)] backdrop-blur-lg border border-[var(--ui-border)] rounded-lg shadow-2xl z-20 overflow-hidden text-[var(--text-color-primary)]">
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2">
                    <ThemeIcon />
                    <span>{t('theme')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setTheme('light')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${theme === 'light' ? 'bg-violet-600 text-white' : 'hover:bg-white/10'}`}
                    >
                        {t('light')}
                    </button>
                     <button 
                        onClick={() => setTheme('dark')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${theme === 'dark' ? 'bg-violet-600 text-white' : 'hover:bg-white/10'}`}
                    >
                        {t('dark')}
                    </button>
                </div>
            </div>
            <div className="border-t border-[var(--ui-border)]"></div>
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2">
                    <LanguageIcon />
                    <span>{t('language')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleLanguageChange('en')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-violet-600 text-white' : 'hover:bg-white/10'}`}
                    >
                        English
                    </button>
                     <button 
                        onClick={() => handleLanguageChange('zh')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${language === 'zh' ? 'bg-violet-600 text-white' : 'hover:bg-white/10'}`}
                    >
                        中文
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsMenu;
