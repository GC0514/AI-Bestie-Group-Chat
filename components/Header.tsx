import React, { useContext } from 'react';
import { GroupIcon, UserIcon } from './Icons';
import { LocalizationContext } from '../App';
import type { Conversation } from '../types';
import { PERSONAS } from '../data/personas';

interface HeaderProps {
    conversation: Conversation;
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const { t } = useContext(LocalizationContext);

  const name = conversation.isGroup ? t('groupChat') : conversation.name;
  const persona = !conversation.isGroup ? PERSONAS[conversation.id as keyof typeof PERSONAS] : null;
  
  return (
    <header className="p-4 bg-[var(--ui-panel-bg)] backdrop-blur-sm border-b border-[var(--ui-border)] shadow-sm flex-shrink-0">
      <div className="flex items-center gap-3">
        {conversation.isGroup ? <GroupIcon /> : (
          <img src={persona?.avatar} alt={persona?.name} className="w-8 h-8 rounded-full object-cover" />
        )}
        <h1 className="text-lg font-bold text-[var(--text-color-primary)]">
            {name}
        </h1>
      </div>
    </header>
  );
};

export default Header;