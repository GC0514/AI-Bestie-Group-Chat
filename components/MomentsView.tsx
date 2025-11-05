
import React, { useContext } from 'react';
import type { Moment } from '../types';
import { LocalizationContext } from '../App';
import { MomentsIcon } from './Icons';
import { PERSONAS } from '../data/personas';

interface MomentsViewProps {
  moments: Moment[];
  onBack?: () => void;
}

const timeAgo = (timestamp: number, t: (key: string) => string): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return `${seconds}秒前`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
};

const MomentsView: React.FC<MomentsViewProps> = ({ moments, onBack }) => {
    const { t } = useContext(LocalizationContext);
    
    return (
        <div className="flex flex-col flex-1 h-full bg-[var(--ui-bg)]">
            <header className="p-4 bg-[var(--ui-panel-bg)] backdrop-blur-sm border-b border-[var(--ui-border)] shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <MomentsIcon isActive className="w-6 h-6" />
                    <h1 className="text-lg font-bold text-[var(--text-color-primary)]">
                        {t('moments')}
                    </h1>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {moments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-color-secondary)]">
                        <MomentsIcon isActive={false} className="w-24 h-24 mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold mb-2 text-[var(--text-color-primary)]">{t('noMoments')}</h2>
                        <p className="max-w-sm">{t('noMomentsDesc')}</p>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-xl mx-auto">
                        {moments.map(moment => {
                            const persona = PERSONAS[moment.personaName];
                            return (
                                <div key={moment.id} className="bg-[var(--ui-panel-bg)] p-4 rounded-lg shadow-lg border border-[var(--ui-border)] flex gap-4">
                                    <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className={`font-semibold ${persona.color}`}>{persona.name}</h3>
                                            <time className="text-xs text-[var(--text-color-secondary)]">{timeAgo(moment.timestamp, t)}</time>
                                        </div>
                                        <p className="mt-1 text-[var(--text-color-primary)] whitespace-pre-wrap">{moment.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MomentsView;
