
import React, { useRef, useEffect, useState } from 'react';
import type { Conversation, ConversationID, PersonaName } from '../types';
import Header from './Header';
import ChatBubble from './ChatBubble';
import ChatInputZone from './ChatInputZone';
import { PERSONAS } from '../data/personas';

interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (text: string, chatId: ConversationID | null) => void;
  onGenerateDiary: (chatId: ConversationID | null) => void;
  isLoading: boolean;
  onBack?: () => void;
}

const TypingIndicator: React.FC<{personaName?: PersonaName}> = ({ personaName }) => {
    const [dynamicPersonaName, setDynamicPersonaName] = useState<PersonaName | undefined>(personaName);

    useEffect(() => {
        if (!personaName) {
            // Group chat: pick a random persona to show as typing
            const personaNames = Object.keys(PERSONAS) as PersonaName[];
            const randomIndex = Math.floor(Math.random() * personaNames.length);
            setDynamicPersonaName(personaNames[randomIndex]);
        } else {
            setDynamicPersonaName(personaName);
        }
    }, [personaName]);
    
    const persona = dynamicPersonaName ? PERSONAS[dynamicPersonaName] : null;

    return (
        <div className="flex items-end gap-3 px-4 py-1">
            {persona && (
                 <div className="w-10 h-10 rounded-full flex-shrink-0 shadow-md">
                    <img src={persona.avatar} alt={persona.name} className="w-full h-full rounded-full object-cover" />
                </div>
            )}
             {!persona && (
                 <div className="w-10 h-10 rounded-full flex-shrink-0 shadow-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white/80">
                    BFF
                 </div>
             )}
            <div className="flex flex-col items-start">
                 {persona && (
                    <span className={`text-sm font-semibold mb-1 px-2 ${persona.color}`}>
                        {persona.name}
                    </span>
                 )}
                 <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-[var(--ui-panel-bg)] border border-[var(--ui-border)] flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </div>
            </div>
        </div>
    )
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, onGenerateDiary, isLoading, onBack }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation.messages, isLoading]);
  
  const handleSend = (text: string) => {
      onSendMessage(text, conversation.id);
  }

  const handleGenerateDiary = () => {
    onGenerateDiary(conversation.id);
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-[var(--ui-bg)]">
      <Header conversation={conversation} onBack={onBack} />
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {conversation.messages.map((msg, index) => (
          <ChatBubble key={`${conversation.id}-${index}`} message={msg} />
        ))}
        {isLoading && (
            <TypingIndicator personaName={conversation.isGroup ? undefined : conversation.id as PersonaName} />
        )}
      </div>
      <ChatInputZone 
        onSendMessage={handleSend} 
        onGenerateDiary={handleGenerateDiary}
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatWindow;
