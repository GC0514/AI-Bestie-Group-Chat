import React, { useContext } from 'react';
import { CloseIcon, ZodiacIcon, MbtiIcon, QuoteIcon, OccupationIcon, HobbiesIcon, FavoriteFoodIcon } from './Icons';
import type { Persona, PersonaName } from '../types';
import { LocalizationContext } from '../App';


interface ProfileCardProps {
    persona: Persona;
    onClose: () => void;
    onStartChat: (personaName: PersonaName) => void;
}

const InfoRow: React.FC<{icon: React.ReactNode, label: string, value: string | string[]}> = ({icon, label, value}) => (
    <div className="flex items-start gap-3">
        <div className="text-violet-300 mt-1 flex-shrink-0 w-5 h-5">{icon}</div>
        <div className="min-w-0">
            <h4 className="text-xs font-bold text-violet-200 uppercase tracking-wider">{label}</h4>
            <p className="text-slate-100 break-words">{Array.isArray(value) ? value.join(', ') : value}</p>
        </div>
    </div>
);


const ProfileCard: React.FC<ProfileCardProps> = ({ persona, onClose, onStartChat }) => {
    const { t } = useContext(LocalizationContext);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-sm m-4 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-0">
                    <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative flex flex-col justify-end h-[600px] max-h-[90vh] p-6 text-white">
                    <div className="flex-grow"></div>
                    <div className="overflow-y-auto pr-2 -mr-2">
                        <h2 className="text-4xl font-bold">{persona.name}</h2>
                        <p className={`font-semibold text-lg ${persona.color}`}>{persona.description}</p>
                        
                        <div className="my-4 border-t border-white/20"></div>

                        <div className="space-y-4 text-slate-200 text-sm">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                               <InfoRow icon={<OccupationIcon />} label={t('occupation')} value={persona.occupation} />
                               <InfoRow icon={<ZodiacIcon />} label={t('zodiac')} value={persona.zodiac} />
                               <InfoRow icon={<MbtiIcon />} label={t('mbti')} value={persona.mbti} />
                               <InfoRow icon={<FavoriteFoodIcon />} label={t('favoriteFood')} value={persona.favoriteFood} />
                            </div>
                             <InfoRow icon={<HobbiesIcon />} label={t('hobbies')} value={persona.hobbies} />
                             <InfoRow icon={<QuoteIcon />} label={t('motto')} value={persona.quote} />

                            <p className="pt-2">{persona.detailedDescription}</p>
                            
                            <div>
                                <h3 className="font-bold text-white mb-2">{t('tags')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {persona.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/10 text-xs font-semibold rounded-full backdrop-blur-sm">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                     <div className="mt-6 flex-shrink-0">
                        <button 
                            onClick={() => onStartChat(persona.name)}
                            className="w-full px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-all transform hover:scale-105"
                        >
                            {t('chat')}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-colors z-10"
                    aria-label={t('close')}
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { transform: translateY(20px) scale(0.98); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
            `}</style>
        </div>
    );
};

export default ProfileCard;