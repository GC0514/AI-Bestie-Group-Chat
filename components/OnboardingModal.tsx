import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface OnboardingModalProps {
  onSave: (profile: UserProfile) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && description.trim()) {
      onSave({ nickname, description });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-100 to-sky-200 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-slate-800 animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">欢迎来到闺蜜团！</h1>
          <p className="text-slate-600 mt-2">很高兴认识你！为了让你的闺蜜们更好地了解你，请创建一个简单的个人档案吧。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-1">
              你的昵称是？
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
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
              可以简单介绍一下自己吗？
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="比如：一个爱画画的大学生，最近有点小烦恼..."
              className="w-full px-4 py-2 bg-white/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition h-24 resize-none"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={!nickname.trim() || !description.trim()}
              className="w-full px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 disabled:bg-slate-400 transition-all transform hover:scale-105 disabled:scale-100"
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
