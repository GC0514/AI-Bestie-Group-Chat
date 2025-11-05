
import React, { useContext } from 'react';
import { ChatIcon, ContactsIcon, MeIcon, MomentsIcon } from './Icons';
import { LocalizationContext } from '../App';
import type { View } from '../types';

interface BottomNavBarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-violet-400' : 'text-[var(--text-color-secondary)] hover:text-violet-400'}`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
    const { t } = useContext(LocalizationContext);

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--ui-panel-bg)] border-t border-[var(--ui-border)] flex items-center justify-around md:hidden backdrop-blur-lg z-30">
            <NavButton
                label={t('chats')}
                icon={<ChatIcon isActive={activeView === 'chats'} className="w-6 h-6" />}
                isActive={activeView === 'chats'}
                onClick={() => setActiveView('chats')}
            />
            <NavButton
                label={t('moments')}
                icon={<MomentsIcon isActive={activeView === 'moments'} className="w-6 h-6" />}
                isActive={activeView === 'moments'}
                onClick={() => setActiveView('moments')}
            />
            <NavButton
                label={t('contacts')}
                icon={<ContactsIcon isActive={activeView === 'contacts'} className="w-6 h-6" />}
                isActive={activeView === 'contacts'}
                onClick={() => setActiveView('contacts')}
            />
            <NavButton
                label={t('me')}
                icon={<MeIcon isActive={activeView === 'me'} className="w-6 h-6" />}
                isActive={activeView === 'me'}
                onClick={() => setActiveView('me')}
            />
        </nav>
    );
};

export default BottomNavBar;
