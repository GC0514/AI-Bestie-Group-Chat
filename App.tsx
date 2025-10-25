import React, { useState, useEffect, useCallback } from 'react';
import type { ChatMessage, Conversation, ConversationID, PersonaName, Theme, Language, UserProfile } from './types';
import { getBestiesResponse, getSingleBestieResponse } from './services/geminiService';
import { PERSONAS, locales } from './constants';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import TopBar from './components/TopBar';
import ContactsView from './components/ContactsView';
import ProfileCard from './components/ProfileCard';
import OnboardingModal from './components/OnboardingModal';

export const LocalizationContext = React.createContext({
  t: (key: string) => locales.en[key] || key,
  setLanguage: (lang: Language) => {},
  language: 'en' as Language,
});


const App: React.FC = () => {
  const [conversations, setConversations] = useState<Partial<Record<ConversationID, Conversation>>>(() => {
    try {
      const savedConvos = localStorage.getItem('conversations');
      return savedConvos ? JSON.parse(savedConvos) : {
        group: {
          id: 'group',
          name: '闺蜜团 (Group Chat)',
          messages: [{ sender: 'System', text: "Your besties are here! Tell them what's on your mind." }],
          isGroup: true,
        },
      };
    } catch (error) {
      console.error("Failed to load conversations from localStorage", error);
      return {
        group: {
          id: 'group',
          name: '闺蜜团 (Group Chat)',
          messages: [{ sender: 'System', text: "Your besties are here! Tell them what's on your mind." }],
          isGroup: true,
        },
      };
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        return savedProfile ? JSON.parse(savedProfile) : null;
      } catch (error) {
        console.error("Failed to load user profile from localStorage", error);
        return null;
      }
  });

  const [activeChatId, setActiveChatId] = useState<ConversationID>('group');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('zh');
  const [activeView, setActiveView] = useState<'chats' | 'contacts'>('chats');
  const [profileCardPersona, setProfileCardPersona] = useState<PersonaName | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error("Failed to save conversations to localStorage", error);
    }
  }, [conversations]);

  useEffect(() => {
    try {
        if (userProfile) {
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
    } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
    }
  }, [userProfile]);


  const t = useCallback((key: string) => {
    return locales[language][key] || locales['en'][key] || key;
  }, [language]);


  const startPrivateChat = useCallback((personaName: PersonaName) => {
    if (!conversations[personaName]) {
      const newConversation: Conversation = {
        id: personaName,
        name: PERSONAS[personaName].name,
        messages: [{ sender: 'System', text: `You can now chat privately with ${PERSONAS[personaName].name}.` }],
        isGroup: false,
      };
      setConversations(prev => ({ ...prev, [personaName]: newConversation }));
    }
    setActiveChatId(personaName);
    setActiveView('chats');
    setProfileCardPersona(null);
  }, [conversations]);
  
  const handleCloseChat = useCallback((chatId: ConversationID) => {
    if (chatId === 'group') return;
    setConversations(prev => {
      const newConversations = { ...prev };
      delete newConversations[chatId];
      return newConversations;
    });
    if (activeChatId === chatId) {
      setActiveChatId('group');
    }
  }, [activeChatId]);

  const handleSendMessage = useCallback(async (text: string, chatId: ConversationID) => {
    if (!text.trim() || !userProfile) return;
    const userMessage: ChatMessage = { sender: 'Me', text };
    
    setConversations(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, userMessage] }
    }));
    
    setIsLoading(true);

    try {
      if (chatId === 'group') {
        const aiResponses = await getBestiesResponse(text, language, userProfile);
        aiResponses.forEach((res, index) => {
          setTimeout(() => {
            setConversations(prev => ({
              ...prev,
              [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, res] }
            }));
          }, (index + 1) * 400);
        });
        setTimeout(() => setIsLoading(false), aiResponses.length * 400);

      } else {
        const personaName = chatId as PersonaName;
        const aiResponse = await getSingleBestieResponse(text, personaName, language, userProfile);
         setConversations(prev => ({
            ...prev,
            [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, aiResponse] }
        }));
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { sender: 'System', text: 'Sorry, there was an error. Please try again later.' };
      setConversations(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, errorMessage] }
      }));
      setIsLoading(false);
    }
  }, [language, userProfile]);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const activeConversation = conversations[activeChatId];

  if (!userProfile) {
    return <OnboardingModal onSave={handleSaveProfile} />;
  }

  return (
    <LocalizationContext.Provider value={{ t, setLanguage, language }}>
      <div className="flex h-screen bg-[var(--ui-bg)] text-[var(--text-color-primary)] backdrop-blur-xl font-sans">
        
        <div className="flex flex-col flex-shrink-0 w-full md:w-[25rem] lg:w-[28rem] border-r border-[var(--ui-border)]">
           <TopBar theme={theme} setTheme={setTheme} />
           <div className="flex flex-grow overflow-hidden">
              <Sidebar activeView={activeView} setActiveView={setActiveView} />
              <div className="flex-1 overflow-hidden">
                {activeView === 'chats' ? (
                  <ChatList
                    conversations={Object.values(conversations)}
                    activeChatId={activeChatId}
                    onSelectChat={setActiveChatId}
                    onCloseChat={handleCloseChat}
                  />
                ) : (
                  <ContactsView onSelectPersona={setProfileCardPersona} />
                )}
              </div>
           </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <ChatWindow
              key={activeChatId}
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          ) : (
             <div className="flex-1 flex items-center justify-center text-center text-[var(--text-color-secondary)]">
                <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
        
        {profileCardPersona && (
          <ProfileCard 
            persona={PERSONAS[profileCardPersona]} 
            onClose={() => setProfileCardPersona(null)}
            onStartChat={startPrivateChat}
          />
        )}
      </div>
    </LocalizationContext.Provider>
  );
};

export default App;
