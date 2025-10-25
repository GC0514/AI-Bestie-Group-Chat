import React, { useState, useRef, useContext } from 'react';
import { SendIcon, EmojiIcon, DiaryIcon } from './Icons';
import EmojiPicker from './EmojiPicker';
import { LocalizationContext } from '../App';


interface ChatInputZoneProps {
  onSendMessage: (text: string) => void;
  onGenerateDiary: () => void;
  isLoading: boolean;
}

const ChatInputZone: React.FC<ChatInputZoneProps> = ({ onSendMessage, onGenerateDiary, isLoading }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useContext(LocalizationContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
    inputRef.current?.focus();
  };
  
  const handleDiaryClick = () => {
    if (!isLoading) {
      onGenerateDiary();
    }
  }

  return (
    <div className="bg-[var(--ui-panel-bg)] backdrop-blur-sm border-t border-[var(--ui-border)] p-2">
      <div className="relative">
        {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center space-x-2 px-2 pb-2">
         <button
            type="button"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="p-2 text-[var(--text-color-secondary)] hover:text-violet-400 transition-colors rounded-full hover:bg-white/10"
            aria-label={t('openEmojiPicker')}
          >
            <EmojiIcon />
          </button>
           <button
            type="button"
            onClick={handleDiaryClick}
            disabled={isLoading}
            className="p-2 text-[var(--text-color-secondary)] hover:text-violet-400 transition-colors rounded-full hover:bg-white/10 disabled:opacity-50"
            aria-label={t('generateDiary')}
            title={t('generateDiary')}
          >
            <DiaryIcon isActive={false} className="w-6 h-6"/>
          </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 px-2">
        <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isLoading ? t('generating') : t('saySomething')}
            disabled={isLoading}
            className="flex-1 w-full px-4 py-3 bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-colors text-[var(--text-color-primary)]"
            autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="bg-violet-600 text-white rounded-full p-3 hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 aspect-square"
          aria-label={t('sendMessage')}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatInputZone;