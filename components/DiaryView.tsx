import React, { useContext } from 'react';
import type { DiaryEntry } from '../types';
import { LocalizationContext } from '../App';
import { DiaryIcon } from './Icons';

interface DiaryViewProps {
  entries: DiaryEntry[];
}

const DiaryView: React.FC<DiaryViewProps> = ({ entries }) => {
    const { t } = useContext(LocalizationContext);
    
    return (
        <div className="flex flex-col flex-1 h-full bg-[var(--ui-bg)]">
            <header className="p-4 bg-[var(--ui-panel-bg)] backdrop-blur-sm border-b border-[var(--ui-border)] shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <DiaryIcon isActive className="w-6 h-6" />
                    <h1 className="text-lg font-bold text-[var(--text-color-primary)]">
                        {t('myDiary')}
                    </h1>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-color-secondary)]">
                        <DiaryIcon isActive={false} className="w-24 h-24 mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold mb-2 text-[var(--text-color-primary)]">{t('myDiary')}</h2>
                        <p className="max-w-sm">{t('noDiaryEntries')}</p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {entries.map((entry, index) => (
                            <article key={index} className="bg-[var(--ui-panel-bg)] p-6 rounded-lg shadow-lg border border-[var(--ui-border)]">
                                <header className="mb-4 pb-3 border-b border-[var(--ui-border)]">
                                    <h2 className="text-2xl font-bold text-[var(--text-color-primary)]">{entry.title}</h2>
                                    <time className="text-sm text-[var(--text-color-secondary)] mt-1">{entry.date}</time>
                                </header>
                                <div className="prose prose-invert max-w-none text-[var(--text-color-secondary)] leading-relaxed whitespace-pre-wrap">
                                    <p className="text-[var(--text-color-primary)]">{entry.content}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
             <style>{`
                .prose { color: var(--text-color-secondary); }
                .prose h1, .prose h2, .prose h3, .prose strong { color: var(--text-color-primary); }
             `}</style>
        </div>
    );
};

export default DiaryView;