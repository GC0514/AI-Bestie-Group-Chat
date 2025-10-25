import React, { useContext } from 'react';
import type { Theme, Language } from '../types';
import { LocalizationContext } from '../App';
import { ThemeIcon, LanguageIcon, ExportIcon, ImportIcon, ProfileIcon } from './Icons';

interface SettingsMenuProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onEditProfile: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ theme, setTheme, onClose, onExport, onImport, onEditProfile }) => {
    const { t, language, setLanguage } = useContext(LocalizationContext);
    
    const handleAction = (action: () => void) => {
        action();
        onClose();
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--ui-panel-bg)] backdrop-blur-lg border border-[var(--ui-border)] rounded-lg shadow-2xl z-20 overflow-hidden text-[var(--text-color-primary)]">
            {/* Profile Section */}
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2 px-1">
                    <ProfileIcon />
                    <span>{t('profile')}</span>
                </div>
                <button 
                    onClick={() => handleAction(onEditProfile)}
                    className="w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-white/10"
                >
                    {t('editProfile')}
                </button>
            </div>
            <div className="border-t border-[var(--ui-border)]"></div>

            {/* Data Management Section */}
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2 px-1">
                    <ExportIcon />
                    <span>{t('dataManagement')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleAction(onExport)}
                        className="px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-white/10 flex items-center justify-center gap-1"
                    >
                        {t('exportData')}
                    </button>
                     <button 
                        onClick={() => handleAction(onImport)}
                        className="px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-white/10 flex items-center justify-center gap-1"
                    >
                       {t('importData')}
                    </button>
                </div>
            </div>
            <div className="border-t border-[var(--ui-border)]"></div>

            {/* Theme Section */}
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2 px-1">
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

            {/* Language Section */}
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2 px-1">
                    <LanguageIcon />
                    <span>{t('language')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleAction(() => setLanguage('en'))}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-violet-600 text-white' : 'hover:bg-white/10'}`}
                    >
                        English
                    </button>
                     <button 
                        onClick={() => handleAction(() => setLanguage('zh'))}
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