import React, { useContext } from 'react';
import type { Conversation, ConversationID, PersonaName } from '../types';
import { CloseIcon } from './Icons';
import { PERSONAS } from '../constants';
import { LocalizationContext } from '../App';

interface ChatListProps {
  conversations: Conversation[];
  activeChatId: ConversationID;
  onSelectChat: (id: ConversationID) => void;
  onCloseChat: (id: ConversationID) => void;
}

const PersonaIcon: React.FC<{ personaName: PersonaName }> = ({ personaName }) => {
    const persona = PERSONAS[personaName];
    return (
        <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
    );
};

const GroupIconDisplay: React.FC = () => {
    return (
        <div className="w-12 h-12 rounded-full flex-shrink-0 grid grid-cols-2 grid-rows-2 p-0.5 bg-gradient-to-br from-violet-500 to-fuchsia-500">
            {Object.values(PERSONAS).slice(0, 4).map(p => (
                 <img key={p.name} src={p.avatar} title={p.name} className="w-full h-full rounded-full object-cover" />
            ))}
        </div>
    )
}

const ChatList: React.FC<ChatListProps> = ({ conversations, activeChatId, onSelectChat, onCloseChat }) => {
  const { t } = useContext(LocalizationContext);
  
  const handleClose = (e: React.MouseEvent, id: ConversationID) => {
    e.stopPropagation();
    onCloseChat(id);
  };

  return (
    <div className="h-full bg-[var(--ui-panel-bg)] flex flex-col">
      <header className="p-4 border-b border-[var(--ui-border)] flex-shrink-0">
        <h2 className="text-xl font-bold">{t('chats')}</h2>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ul>
          {conversations.map(convo => {
            const isActive = convo.id === activeChatId;
            const lastMessage = convo.messages[convo.messages.length - 1];
            return (
              <li
                key={convo.id}
                onClick={() => onSelectChat(convo.id)}
                className={`flex items-center p-3 cursor-pointer transition-colors duration-200 group relative ${isActive ? 'bg-violet-500/30' : 'hover:bg-violet-500/10'}`}
              >
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-violet-400 rounded-r-full"></div>}
                <div className="mr-4">
                    {convo.isGroup ? <GroupIconDisplay/> : <PersonaIcon personaName={convo.id as PersonaName} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold truncate">{convo.isGroup ? t('groupChat') : convo.name}</h3>
                  {lastMessage && <p className="text-sm text-[var(--text-color-secondary)] truncate">{lastMessage.sender === 'Me' ? 'You: ' : ''}{lastMessage.text}</p>}
                </div>
                {!convo.isGroup && (
                  <button
                    onClick={(e) => handleClose(e, convo.id)}
                    className="ml-2 p-1 rounded-full text-slate-500 hover:bg-red-500/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`${t('closeChat')} ${convo.name}`}
                  >
                    <CloseIcon />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;