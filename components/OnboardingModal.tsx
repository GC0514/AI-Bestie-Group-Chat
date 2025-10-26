
import React, { useState, useContext } from 'react';
import type { UserProfile } from '../types';
import { MBTI_DESCRIPTIONS, ZODIAC_SIGNS } from '../data/personas';
import { LocalizationContext } from '../App';

interface OnboardingModalProps {
  onSave: (profile: UserProfile) => void;
}

const MBTI_TYPES = Object.keys(MBTI_DESCRIPTIONS);

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [mbti, setMbti] = useState('');
  const [tags, setTags] = useState('');
  const { t } = useContext(LocalizationContext);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && description.trim()) {
      onSave({ 
          nickname, 
          description, 
          zodiac, 
          mbti, 
          tags: tags.split(/[,，\s]+/).filter(Boolean),
          keyMemories: {}, // Initialize empty memories
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-100 to-sky-200 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-slate-800 animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('welcomeTitle')}</h1>
          <p className="text-slate-600 mt-2">{t('welcomeSubtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-1">
                {t('nicknamePrompt')} *
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t('nicknamePlaceholder')}
                className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-slate-700 mb-1">
                {t('tagsPrompt')}
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('tagsPlaceholder')}
                className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="zodiac" className="block text-sm font-semibold text-slate-700 mb-1">
                  {t('zodiacPrompt')}
                </label>
                <select id="zodiac" value={zodiac} onChange={e => setZodiac(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="">{t('zodiacPlaceholder')}</option>
                    {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="mbti" className="block text-sm font-semibold text-slate-700 mb-1">
                  {t('mbtiPrompt')}
                </label>
                <select id="mbti" value={mbti} onChange={e => setMbti(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="">{t('mbtiPlaceholder')}</option>
                    {MBTI_TYPES.map(type => <option key={type} value={type}>{type} - {MBTI_DESCRIPTIONS[type]}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('descriptionPrompt')} *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition h-20 resize-none"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={!nickname.trim() || !description.trim()}
              className="w-full mt-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 disabled:bg-slate-400 transition-all transform hover:scale-105 disabled:scale-100"
            >
              {t('onboardingSubmit')}
            </button>
          </div>
        </form>
      </div>
       <style>{`
            @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
        `}</style>
    </div>
  );
};

export default OnboardingModal;
