import React, { useState, useRef, useEffect, useContext } from 'react';
import { SettingsIcon, UserIcon } from './Icons';
import SettingsMenu from './SettingsMenu';
import type { Theme } from '../types';

interface TopBarProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const TopBar: React.FC<TopBarProps> = ({ theme, setTheme }) => {
    const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="h-16 flex-shrink-0 bg-transparent flex items-center justify-between px-4 md:px-6 border-b border-[var(--ui-border)]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white">
                    <UserIcon />
                </div>
                <span className="font-bold text-lg hidden md:inline">Me</span>
            </div>
            <div className="relative" ref={settingsRef}>
                <button 
                    onClick={() => setShowSettings(prev => !prev)} 
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]"
                >
                    <SettingsIcon />
                </button>
                {showSettings && <SettingsMenu theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}
            </div>
        </div>
    );
};

export default TopBar;