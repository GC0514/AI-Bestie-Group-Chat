import React, { useContext } from 'react';
import { PERSONAS } from '../constants';
import type { PersonaName } from '../types';
import { LocalizationContext } from '../App';

interface ContactsViewProps {
  onSelectPersona: (personaName: PersonaName) => void;
}

const ContactsView: React.FC<ContactsViewProps> = ({ onSelectPersona }) => {
    const { t } = useContext(LocalizationContext);

    return (
        <div className="h-full bg-[var(--ui-panel-bg)] flex flex-col">
            <header className="p-4 border-b border-[var(--ui-border)] flex-shrink-0">
                <h2 className="text-xl font-bold">{t('contacts')}</h2>
            </header>
            <div className="flex-1 overflow-y-auto">
                <ul>
                    {Object.values(PERSONAS).map(persona => {
                        return (
                            <li
                                key={persona.name}
                                onClick={() => onSelectPersona(persona.name)}
                                className="flex items-center p-3 cursor-pointer transition-colors duration-200 hover:bg-violet-500/10"
                            >
                                <div className="mr-4">
                                    <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-full object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-semibold truncate">{persona.name}</h3>
                                    <p className="text-sm text-[var(--text-color-secondary)] truncate">{persona.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ContactsView;