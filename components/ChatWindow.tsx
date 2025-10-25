import React, { useRef, useEffect } from 'react';
import type { Conversation, ConversationID } from '../types';
import Header from './Header';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (text: string, chatId: ConversationID) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, isLoading }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation.messages]);
  
  const handleSend = (text: string) => {
      onSendMessage(text, conversation.id);
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-[var(--ui-bg)]">
      <Header conversation={conversation} />
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {conversation.messages.map((msg, index) => (
          <ChatBubble key={`${conversation.id}-${index}`} message={msg} />
        ))}
        {isLoading && (
            <div className="flex justify-start items-end space-x-3 px-4 py-1 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[var(--ui-panel-bg)]"></div>
                <div className="flex flex-col items-start">
                    <div className="h-4 bg-[var(--ui-panel-bg)] rounded w-20 mb-1"></div>
                    <div className="p-3 rounded-2xl rounded-bl-none bg-[var(--ui-panel-bg)] max-w-sm">
                        <div className="h-5 bg-slate-700/50 rounded w-32"></div>
                    </div>
                </div>
            </div>
        )}
      </div>
      <MessageInput onSendMessage={handleSend} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;