
import React, { useState, useContext } from 'react';
import type { UserProfile } from '../types';
import { MBTI_DESCRIPTIONS, ZODIAC_SIGNS } from '../data/personas';
import { LocalizationContext } from '../App';

interface ProfileModalProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const MBTI_TYPES = Object.keys(MBTI_DESCRIPTIONS);

const ProfileModal: React.FC<ProfileModalProps> = ({ userProfile, onSave, onClose }) => {
  const [nickname, setNickname] = useState(userProfile.nickname);
  const [description, setDescription] = useState(userProfile.description);
  const [zodiac, setZodiac] = useState(userProfile.zodiac);
  const [mbti, setMbti] = useState(userProfile.mbti);
  const [tags, setTags] = useState(userProfile.tags.join(', '));
  const { t } = useContext(LocalizationContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && description.trim()) {
      onSave({ 
          ...userProfile, // Preserve existing fields like keyMemories
          nickname, 
          description, 
          zodiac, 
          mbti, 
          tags: tags.split(/[,，\s]+/).filter(Boolean) 
        });
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--ui-bg)] backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-[var(--text-color-primary)] animate-slide-up border border-[var(--ui-border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-color-primary)]">{t('editProfile')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nickname-edit" className="block text-sm font-semibold text-[var(--text-color-secondary)] mb-1">
                {t('profile')}: {t('nickname')} *
              </label>
              <input
                id="nickname-edit"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-[var(--ui-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="tags-edit" className="block text-sm font-semibold text-[var(--text-color-secondary)] mb-1">
                {t('tags')}
              </label>
              <input
                id="tags-edit"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分开, 如: 猫奴, 咖啡控"
                className="w-full px-4 py-2 bg-white/10 border border-[var(--ui-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="zodiac-edit" className="block text-sm font-semibold text-[var(--text-color-secondary)] mb-1">
                  {t('zodiac')} (可选)
                </label>
                <select id="zodiac-edit" value={zodiac} onChange={e => setZodiac(e.target.value)} className="w-full px-4 py-2 bg-white/10 border border-[var(--ui-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="">选择你的星座</option>
                    {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="mbti-edit" className="block text-sm font-semibold text-[var(--text-color-secondary)] mb-1">
                  {t('mbti')} (可选)
                </label>
                <select id="mbti-edit" value={mbti} onChange={e => setMbti(e.target.value)} className="w-full px-4 py-2 bg-white/10 border border-[var(--ui-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="">不确定/不想说</option>
                    {MBTI_TYPES.map(type => <option key={type} value={type}>{type} - {MBTI_DESCRIPTIONS[type]}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label htmlFor="description-edit" className="block text-sm font-semibold text-[var(--text-color-secondary)] mb-1">
              {t('profile')}: {t('description')} *
            </label>
            <textarea
              id="description-edit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-[var(--ui-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition h-20 resize-none"
              required
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
            >
                {t('close')}
            </button>
            <button
              type="submit"
              disabled={!nickname.trim() || !description.trim()}
              className="w-full mt-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 disabled:bg-slate-400 transition-all transform hover:scale-105 disabled:scale-100"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
       <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slide-up {
                from { transform: translateY(20px) scale(0.98); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
        `}</style>
    </div>
  );
};

export default ProfileModal;
