
import React, { useContext } from 'react';
import type { UserProfile, Theme } from '../types';
import { LocalizationContext } from '../App';
import { DiaryIcon, ProfileIcon, ExportIcon, ImportIcon, ThemeIcon, LanguageIcon, UserIcon, MemoryIcon } from './Icons';

interface MeViewProps {
    userProfile: UserProfile | null;
    onEditProfile: () => void;
    onShowDiary: () => void;
    onShowMemories: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onExport: () => void;
    onImport: () => void;
}

const MeView: React.FC<MeViewProps> = ({ userProfile, onEditProfile, onShowDiary, onShowMemories, theme, setTheme, onExport, onImport }) => {
    const { t, language, setLanguage } = useContext(LocalizationContext);

    if (!userProfile) {
        return null;
    }
    
    return (
        <div className="h-full bg-[var(--ui-bg)] text-[var(--text-color-primary)] p-4 pt-8">
            <div className="max-w-md mx-auto">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-8">
                     <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                        <UserIcon />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{userProfile.nickname}</h1>
                        <p className="text-sm text-[var(--text-color-secondary)]">{userProfile.description}</p>
                    </div>
                </div>

                {/* Menu */}
                <div className="space-y-4">
                    {/* Main Actions */}
                    <div className="bg-[var(--ui-panel-bg)] rounded-lg border border-[var(--ui-border)]">
                        <MenuItem icon={<DiaryIcon isActive className="w-5 h-5 text-yellow-400" />} label={t('myDiary')} onClick={onShowDiary} />
                        <MenuItem icon={<MemoryIcon className="w-5 h-5 text-sky-400" />} label={t('myMemories')} onClick={onShowMemories} />
                        <MenuItem icon={<ProfileIcon />} label={t('editProfile')} onClick={onEditProfile} />
                    </div>

                     {/* Data Management */}
                    <div className="bg-[var(--ui-panel-bg)] rounded-lg border border-[var(--ui-border)]">
                        <MenuItem icon={<ExportIcon />} label={t('exportData')} onClick={onExport} />
                        <MenuItem icon={<ImportIcon />} label={t('importData')} onClick={onImport} />
                    </div>

                    {/* Settings */}
                    <div className="bg-[var(--ui-panel-bg)] rounded-lg border border-[var(--ui-border)] p-4">
                         <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2 px-1">
                                <ThemeIcon />
                                <span>{t('theme')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setTheme('light')} className={`py-2 text-sm rounded-md transition-colors ${theme === 'light' ? 'bg-violet-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>{t('light')}</button>
                                <button onClick={() => setTheme('dark')} className={`py-2 text-sm rounded-md transition-colors ${theme === 'dark' ? 'bg-violet-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>{t('dark')}</button>
                            </div>
                        </div>
                         <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color-secondary)] mb-2 px-1">
                                <LanguageIcon />
                                <span>{t('language')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                 <button onClick={() => setLanguage('en')} className={`py-2 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-violet-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>English</button>
                                <button onClick={() => setLanguage('zh')} className={`py-2 text-sm rounded-md transition-colors ${language === 'zh' ? 'bg-violet-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>中文</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuItem: React.FC<{icon: React.ReactNode, label: string, onClick: () => void}> = ({ icon, label, onClick }) => {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg border-b border-[var(--ui-border)] last:border-b-0">
            <div className="text-violet-300">{icon}</div>
            <span className="flex-1 font-medium">{label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-color-secondary)]"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
    )
}

export default MeView;
