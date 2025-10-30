
import React, { useContext } from 'react';
import { ChatIcon, ContactsIcon, DiaryIcon } from './Icons';
import { LocalizationContext } from '../App';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const { t } = useContext(LocalizationContext);

    return (
        <div className="w-20 md:w-24 bg-[var(--ui-panel-bg)] flex flex-col items-center py-4 space-y-8 border-r border-[var(--ui-border)]">
            <div className="space-y-6">
                <button 
                    onClick={() => setActiveView('chats')} 
                    title={t('chats')} 
                    aria-label={t('chats')}
                    className="flex flex-col items-center space-y-1 text-xs text-[var(--text-color-secondary)] hover:text-violet-400 transition-colors"
                >
                    <ChatIcon isActive={activeView === 'chats'} />
                    <span>{t('chats')}</span>
                </button>
                <button 
                    onClick={() => setActiveView('contacts')} 
                    title={t('contacts')} 
                    aria-label={t('contacts')}
                    className="flex flex-col items-center space-y-1 text-xs text-[var(--text-color-secondary)] hover:text-violet-400 transition-colors"
                >
                    <ContactsIcon isActive={activeView === 'contacts'} />
                    <span>{t('contacts')}</span>
                </button>
                 <button 
                    onClick={() => setActiveView('diary')} 
                    title={t('diary')} 
                    aria-label={t('diary')}
                    className="flex flex-col items-center space-y-1 text-xs text-[var(--text-color-secondary)] hover:text-violet-400 transition-colors"
                >
                    <DiaryIcon isActive={activeView === 'diary'} />
                    <span>{t('diary')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
