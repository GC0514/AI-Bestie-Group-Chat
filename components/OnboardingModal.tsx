import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { MBTI_DESCRIPTIONS } from '../constants';

interface OnboardingModalProps {
  onSave: (profile: UserProfile) => void;
}

const ZODIAC_SIGNS = ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"];
const MBTI_TYPES = Object.keys(MBTI_DESCRIPTIONS);

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [mbti, setMbti] = useState('');
  const [tags, setTags] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && description.trim()) {
      onSave({ 
          nickname, 
          description, 
          zodiac, 
          mbti, 
          tags: tags.split(/[,，\s]+/).filter(Boolean) 
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-100 to-sky-200 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-slate-800 animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">欢迎来到闺蜜团！</h1>
          <p className="text-slate-600 mt-2">很高兴认识你！为了让你的闺蜜们更好地了解你，请创建一个简单的个人档案吧。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-1">
                你的昵称是？ *
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="比如：小仙女 or 阿伟"
                className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-slate-700 mb-1">
                你的个性标签？
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分开, 如: 猫奴, 咖啡控"
                className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="zodiac" className="block text-sm font-semibold text-slate-700 mb-1">
                  你的星座是？ (可选)
                </label>
                <select id="zodiac" value={zodiac} onChange={e => setZodiac(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="">选择你的星座</option>
                    {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="mbti" className="block text-sm font-semibold text-slate-700 mb-1">
                  你的MBTI是？ (可选)
                </label>
                <select id="mbti" value={mbti} onChange={e => setMbti(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="">不确定/不想说</option>
                    {MBTI_TYPES.map(type => <option key={type} value={type}>{type} - {MBTI_DESCRIPTIONS[type]}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
              可以简单介绍一下自己吗？ *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="比如：一个爱画画的大学生，最近有点小烦恼..."
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
              和闺蜜们打个招呼！
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