
import React, { useState } from 'react';
import type { ChatMessage, PersonaName } from '../types';
import { PERSONAS } from '../data/personas';

interface ChatBubbleProps {
  message: ChatMessage;
  onReact: (emoji: string) => void;
}

const PersonaIcon: React.FC<{ personaName: PersonaName }> = ({ personaName }) => {
    const persona = PERSONAS[personaName];

    return (
        <div title={persona.name} className="w-10 h-10 rounded-full flex-shrink-0 shadow-md">
            <img src={persona.avatar} alt={persona.name} className="w-full h-full rounded-full object-cover" />
        </div>
    );
};

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😢', '😮', '🙏'];

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onReact }) => {
  const { sender, text, userReaction } = message;
  const [showReactions, setShowReactions] = useState(false);

  const isUser = sender === 'Me';
  const isSystem = sender === 'System';
  const persona = !isUser && !isSystem ? PERSONAS[sender as PersonaName] : null;

  const handleSelectReaction = (emoji: string) => {
    onReact(userReaction === emoji ? '' : emoji); // Toggle reaction off if same emoji is clicked
    setShowReactions(false);
  }

  if (isSystem) {
    return (
        <div className="text-center text-xs text-[var(--text-color-secondary)] py-3 px-2 italic">
            {text}
        </div>
    )
  }

  return (
    <div className={`flex items-end gap-3 px-4 py-1 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && persona && (
        <PersonaIcon personaName={persona.name} />
      )}

      <div 
        onMouseEnter={() => !isUser && setShowReactions(true)}
        onMouseLeave={() => !isUser && setShowReactions(false)}
        className={`relative flex flex-col max-w-sm md:max-w-md lg:max-w-lg ${isUser ? 'items-end' : 'items-start'}`}
      >
        {!isUser && persona && (
          <span className={`text-sm font-semibold mb-1 px-2 ${persona ? persona.color : 'text-[var(--text-color-secondary)]'}`}>
            {persona?.name}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl break-words shadow-lg transition-all duration-300 text-base relative ${
            isUser
              ? 'bg-violet-600 text-white rounded-br-none'
              : 'bg-[var(--ui-panel-bg)] text-[var(--text-color-primary)] rounded-bl-none border border-[var(--ui-border)]'
          }`}
        >
          {text}
          {userReaction && !isUser && (
            <div className="absolute -bottom-3 right-2 bg-[var(--ui-bg)] px-1.5 py-0.5 rounded-full text-xs shadow-md border border-[var(--ui-border)]">
              {userReaction}
            </div>
          )}
        </div>

        {showReactions && !isUser && (
          <div className="absolute top-[-30px] left-0 bg-[var(--ui-panel-bg)] border border-[var(--ui-border)] rounded-full shadow-lg flex items-center p-1 z-10 animate-fade-in-fast">
            {REACTION_EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => handleSelectReaction(emoji)} className="text-xl p-1 rounded-full hover:bg-violet-500/20 transform hover:scale-125 transition-transform">
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
          @keyframes fade-in-fast {
              from { opacity: 0; transform: translateY(5px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ChatBubble;
