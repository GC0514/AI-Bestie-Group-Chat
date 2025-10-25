import React, { useState, useRef, useContext } from 'react';
import { SendIcon, EmojiIcon } from './Icons';
import EmojiPicker from './EmojiPicker';
import { LocalizationContext } from '../App';


interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
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

  return (
    <div className="relative">
        {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 bg-[var(--ui-panel-bg)] backdrop-blur-sm border-t border-[var(--ui-border)]">
            <div className="relative flex-1">
                 <button
                    type="button"
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-secondary)] hover:text-violet-400 transition-colors"
                    aria-label={t('openEmojiPicker')}
                  >
                    <EmojiIcon />
                  </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('saySomething')}
                    disabled={isLoading}
                    className="flex-1 w-full pl-12 pr-4 py-3 bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-colors text-[var(--text-color-primary)]"
                    autoComplete="off"
                />
            </div>
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

export default MessageInput;