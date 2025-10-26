import React, { useContext } from 'react';
import type { DiaryEntry, RegenerationSource } from '../types';
import { LocalizationContext } from '../App';
import { CloseIcon } from './Icons';

interface RegenerateDiaryModalProps {
    entry: DiaryEntry;
    onClose: () => void;
    onRegenerate: (entry: DiaryEntry, source: RegenerationSource) => void;
}

const RegenerateDiaryModal: React.FC<RegenerateDiaryModalProps> = ({ entry, onClose, onRegenerate }) => {
    const { t } = useContext(LocalizationContext);

    const handleRegen = (source: RegenerationSource) => {
        onRegenerate(entry, source);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md bg-[var(--ui-bg)] backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-[var(--text-color-primary)] animate-slide-up border border-[var(--ui-border)]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('regenerate')} "{entry.title}"</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <p className="text-sm text-[var(--text-color-secondary)] mb-6">
                    {t('regenerateDiaryPrompt')}
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => handleRegen('original')}
                        className="w-full text-left px-4 py-3 bg-white/5 rounded-lg hover:bg-violet-500/20 transition-colors"
                    >
                        <h3 className="font-semibold">{t('regenerateFromOriginal')}</h3>
                        <p className="text-xs text-[var(--text-color-secondary)]">{t('regenerateFromOriginalDesc')}</p>
                    </button>
                     <button
                        onClick={() => handleRegen('group')}
                        className="w-full text-left px-4 py-3 bg-white/5 rounded-lg hover:bg-violet-500/20 transition-colors"
                    >
                        <h3 className="font-semibold">{t('regenerateFromGroup')}</h3>
                        <p className="text-xs text-[var(--text-color-secondary)]">{t('regenerateFromGroupDesc')}</p>
                    </button>
                     <button
                        onClick={() => handleRegen('all')}
                        className="w-full text-left px-4 py-3 bg-white/5 rounded-lg hover:bg-violet-500/20 transition-colors"
                    >
                        <h3 className="font-semibold">{t('regenerateFromAll')}</h3>
                        <p className="text-xs text-[var(--text-color-secondary)]">{t('regenerateFromAllDesc')}</p>
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
            `}</style>
        </div>
    );
};

export default RegenerateDiaryModal;