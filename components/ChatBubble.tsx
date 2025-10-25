import React from 'react';
import type { ChatMessage, PersonaName } from '../types';
import { PERSONAS } from '../constants';

interface ChatBubbleProps {
  message: ChatMessage;
}

const PersonaIcon: React.FC<{ personaName: PersonaName }> = ({ personaName }) => {
    const persona = PERSONAS[personaName];

    return (
        <div title={persona.name} className="w-10 h-10 rounded-full flex-shrink-0 shadow-md">
            <img src={persona.avatar} alt={persona.name} className="w-full h-full rounded-full object-cover" />
        </div>
    );
};


const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { sender, text } = message;

  const isUser = sender === 'Me';
  const isSystem = sender === 'System';
  const persona = !isUser && !isSystem ? PERSONAS[sender as PersonaName] : null;

  if (isSystem) {
    return (
        <div className="text-center text-xs text-[var(--text-color-secondary)] py-3 px-2 italic">
            {text}
        </div>
    )
  }

  return (
    <div className={`flex items-end gap-3 px-4 py-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && persona && (
        <PersonaIcon personaName={persona.name} />
      )}

      <div className={`flex flex-col max-w-sm md:max-w-md lg:max-w-lg ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && persona && (
          <span className={`text-sm font-semibold mb-1 px-2 ${persona ? persona.color : 'text-[var(--text-color-secondary)]'}`}>
            {persona?.name}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl break-words shadow-lg transition-all duration-300 text-base ${
            isUser
              ? 'bg-violet-600 text-white rounded-br-none'
              : 'bg-[var(--ui-panel-bg)] text-[var(--text-color-primary)] rounded-bl-none border border-[var(--ui-border)]'
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;