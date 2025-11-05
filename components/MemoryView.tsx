
import React, { useContext, useState } from 'react';
import type { UserProfile } from '../types';
import { LocalizationContext } from '../App';
import { MemoryIcon, BackIcon, CloseIcon } from './Icons';

interface MemoryViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  onBack?: () => void;
}

const MemoryView: React.FC<MemoryViewProps> = ({ userProfile, setUserProfile, onBack }) => {
    const { t } = useContext(LocalizationContext);
    const memories = userProfile.keyMemories || {};

    const handleDeleteItem = (category: string, item: string) => {
        setUserProfile(prev => {
            if (!prev || !prev.keyMemories) return prev;
            const updatedMemories = { ...prev.keyMemories };
            updatedMemories[category] = updatedMemories[category].filter(i => i !== item);
            if (updatedMemories[category].length === 0) {
                delete updatedMemories[category];
            }
            return { ...prev, keyMemories: updatedMemories };
        });
    };
    
    return (
        <div className="flex flex-col flex-1 h-full bg-[var(--ui-bg)]">
            <header className="p-4 bg-[var(--ui-panel-bg)] backdrop-blur-sm border-b border-[var(--ui-border)] shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                         <button onClick={onBack} className="md:hidden p-2 -ml-2 text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]">
                            <BackIcon />
                        </button>
                    )}
                    <MemoryIcon className="w-6 h-6 text-sky-400" />
                    <h1 className="text-lg font-bold text-[var(--text-color-primary)]">
                        {t('memoryCapsule')}
                    </h1>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <p className="text-center text-[var(--text-color-secondary)] mb-8">{t('memoryCapsuleDesc')}</p>
                    {Object.keys(memories).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-color-secondary)] mt-16">
                            <MemoryIcon className="w-24 h-24 mb-4 opacity-50" />
                            <h2 className="text-xl font-semibold mb-2 text-[var(--text-color-primary)]">{t('noMemories')}</h2>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(memories).map(([category, items]) => (
                                <div key={category} className="bg-[var(--ui-panel-bg)] p-4 rounded-lg shadow-lg border border-[var(--ui-border)]">
                                    <h2 className="text-lg font-bold capitalize text-violet-300 mb-3">{category.replace('_', ' & ')}</h2>
                                    <ul className="space-y-2">
                                        {items.map(item => (
                                            <li key={item} className="flex items-center justify-between bg-white/5 p-2 rounded-md group">
                                                <span className="text-[var(--text-color-primary)] text-sm">{item}</span>
                                                <button 
                                                    onClick={() => handleDeleteItem(category, item)}
                                                    className="p-1 rounded-full text-slate-500 hover:bg-red-500/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label={`${t('delete')} ${item}`}
                                                >
                                                    <CloseIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemoryView;
