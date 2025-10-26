
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, Conversation, ConversationID, PersonaName, Theme, Language, UserProfile, DiaryEntry, CombinedData, PersonaInterests } from './types';
import { getBestiesResponse, getSingleBestieResponse, generateDiaryEntry, getProactiveGreeting, extractMemories } from './services/geminiService';
import { PERSONA_INTEREST_MAP } from './data/interests';
import { PERSONAS } from './data/personas';
import { locales } from './data/locales';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import TopBar from './components/TopBar';
import ContactsView from './components/ContactsView';
import ProfileCard from './components/ProfileCard';
import OnboardingModal from './components/OnboardingModal';
import DiaryView from './components/DiaryView';
import ProfileModal from './components/ProfileModal';

export const LocalizationContext = React.createContext({
  t: (key: string) => locales.en[key] || key,
  setLanguage: (lang: Language) => {},
  language: 'en' as Language,
});

// Helper to simulate typing delay
const calculateTypingDelay = (text: string): number => {
    const baseDelay = 500; // Minimum delay in ms
    const perCharDelay = 35; // ms per character
    const randomFactor = Math.random() * 500; // Add some randomness
    return baseDelay + (text.length * perCharDelay) + randomFactor;
};

// Utility to update persona interests based on user's key memories
const updatePersonaInterests = (keyMemories: Record<string, string[]>): PersonaInterests => {
    const newPersonaInterests: PersonaInterests = {};
    for (const personaName in PERSONAS) {
        newPersonaInterests[personaName as PersonaName] = [];
    }

    const allUserInterests = new Set<string>();
    Object.values(keyMemories).forEach(values => {
        values.forEach(value => allUserInterests.add(value.toLowerCase()));
    });

    for (const [interest, personas] of Object.entries(PERSONA_INTEREST_MAP)) {
        if (allUserInterests.has(interest.toLowerCase())) {
            personas.forEach(pName => {
                if (newPersonaInterests[pName]) {
                    newPersonaInterests[pName].push(interest);
                }
            });
        }
    }
    return newPersonaInterests;
};


const App: React.FC = () => {
  const [conversations, setConversations] = useState<Partial<Record<ConversationID, Conversation>>>(() => {
    const defaultState = {
        group: {
          id: 'group',
          name: '闺蜜团 (Group Chat)',
          messages: [{ sender: 'System', text: "Your besties are here! Tell them what's on your mind.", timestamp: Date.now() }],
          isGroup: true,
        },
    };
    try {
      const savedConvos = localStorage.getItem('conversations');
      if (savedConvos) {
          const loadedConvos = JSON.parse(savedConvos);
          // FORTIFIED LOADING: Ensure the essential group chat exists. If not, add it.
          if (!loadedConvos.group) {
              loadedConvos.group = defaultState.group;
          }
          return loadedConvos;
      }
      return defaultState;
    } catch (error) {
      console.error("Failed to load conversations from localStorage", error);
      return defaultState;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            if (!profile.keyMemories) {
                profile.keyMemories = {};
            }
            return profile;
        }
        return null;
      } catch (error) {
        console.error("Failed to load user profile from localStorage", error);
        return null;
      }
  });
  
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    try {
      const savedEntries = localStorage.getItem('diaryEntries');
      return savedEntries ? JSON.parse(savedEntries) : [];
    } catch (error) {
      console.error("Failed to load diary entries from localStorage", error);
      return [];
    }
  });

  const [personaInterests, setPersonaInterests] = useState<PersonaInterests>({});
  const [activeChatId, setActiveChatId] = useState<ConversationID>('group');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('zh');
  const [activeView, setActiveView] = useState<'chats' | 'contacts' | 'diary'>('chats');
  const [profileCardPersona, setProfileCardPersona] = useState<PersonaName | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect to update persona interests when user memories change
  useEffect(() => {
    if (userProfile?.keyMemories) {
        const newInterests = updatePersonaInterests(userProfile.keyMemories);
        setPersonaInterests(newInterests);
    }
  }, [userProfile?.keyMemories]);


  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
      return () => {
          clearLoadingTimeout();
      };
  }, [clearLoadingTimeout]);

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
        console.error("Failed to save user profile from localStorage", error);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
    } catch (error) {
      console.error("Failed to save diary entries from localStorage", error);
    }
  }, [diaryEntries]);


  // Proactive Care feature effect
  useEffect(() => {
    const handleProactiveGreeting = async () => {
        if (!userProfile || !conversations.group) return;
        const groupMessages = conversations.group.messages;
        const lastMessage = groupMessages[groupMessages.length - 1];
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        const now = Date.now();

        if (lastMessage && (now - (lastMessage.timestamp || 0) < SIX_HOURS)) {
            return;
        }
        if (groupMessages.length <= 1) {
            return;
        }

        setIsLoading(true);
        try {
            const recentUserMessages = groupMessages.filter(m => m.sender === 'Me').slice(-5);
            const recentDiaryEntry = diaryEntries.length > 0 ? diaryEntries[0] : null;

            if (recentUserMessages.length === 0 && !recentDiaryEntry) {
                setIsLoading(false);
                return;
            }

            const context = { recentUserMessages, recentDiaryEntry, userProfile };
            
            const greetings = await getProactiveGreeting(context, language);
            if (greetings.length === 0) {
              setIsLoading(false);
              return;
            }
            
            let maxDelay = 0;
            greetings.forEach((greeting) => {
                const delay = calculateTypingDelay(greeting.text) + Math.random() * 1000; // Add extra randomness
                if (delay > maxDelay) {
                    maxDelay = delay;
                }
                setTimeout(() => {
                    setConversations(prev => {
                        const groupChat = prev.group;
                        if (!groupChat) return prev;
                        return {
                            ...prev,
                            group: { ...groupChat, messages: [...groupChat.messages, { ...greeting, timestamp: Date.now() }] }
                        };
                    });
                }, delay);
            });
            
            setTimeout(() => setIsLoading(false), maxDelay);

        } catch (e) {
            console.error("Failed to get proactive greeting:", e);
            setIsLoading(false); 
        }
    };

    const timer = setTimeout(handleProactiveGreeting, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, userProfile]); 


  const t = useCallback((key: string) => {
    return locales[language][key] || locales['en'][key] || key;
  }, [language]);


  const startPrivateChat = useCallback((personaName: PersonaName) => {
    if (!conversations[personaName]) {
      const newConversation: Conversation = {
        id: personaName,
        name: PERSONAS[personaName].name,
        messages: [{ sender: 'System', text: `You can now chat privately with ${PERSONAS[personaName].name}.`, timestamp: Date.now() }],
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

  const mergeMemories = (oldMemories: Record<string, string[]>, newMemories: Record<string, string[]>) => {
    const merged = { ...oldMemories };
    for (const key in newMemories) {
        if (merged[key]) {
            merged[key] = [...new Set([...merged[key], ...newMemories[key]])];
        } else {
            merged[key] = newMemories[key];
        }
    }
    return merged;
  };


  const handleSendMessage = useCallback(async (text: string, chatId: ConversationID) => {
    if (!text.trim() || !userProfile) return;
    
    clearLoadingTimeout();
    
    const userMessage: ChatMessage = { sender: 'Me', text, timestamp: Date.now() };
    
    setConversations(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, userMessage] }
    }));
    
    setIsLoading(true);

    loadingTimeoutRef.current = setTimeout(() => {
        console.error("Watchdog timeout triggered. Forcing loading to false.");
        setIsLoading(false);
        const errorMessage: ChatMessage = { sender: 'System', text: 'Sorry, the request took too long and timed out. Please try again.', timestamp: Date.now() };
        setConversations(prev => ({
            ...prev,
            [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, errorMessage] }
        }));
    }, 35000); // 35-second watchdog

    extractMemories(text, language).then(newMemories => {
        if (Object.keys(newMemories).length > 0) {
            setUserProfile(prevProfile => {
                if (!prevProfile) return null;
                const updatedMemories = mergeMemories(prevProfile.keyMemories || {}, newMemories);
                return { ...prevProfile, keyMemories: updatedMemories };
            });
        }
    }).catch(error => {
        console.error("Failed to extract memories:", error);
    });

    try {
      if (chatId === 'group') {
        const aiResponses = await getBestiesResponse(text, language, userProfile, personaInterests);
        let maxDelay = 0;
        aiResponses.forEach((res) => {
          // Each response gets its own randomized delay, not cumulative
          const delay = calculateTypingDelay(res.text) + Math.random() * 1500;
          if (delay > maxDelay) {
            maxDelay = delay;
          }
          setTimeout(() => {
            setConversations(prev => ({
              ...prev,
              [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, { ...res, timestamp: Date.now() }] }
            }));
          }, delay);
        });

        // Set loading to false after the longest delay has passed
        setTimeout(() => {
            clearLoadingTimeout();
            setIsLoading(false)
        }, maxDelay);

      } else {
        const personaName = chatId as PersonaName;
        const currentConversation = conversations[chatId];
        const history = currentConversation ? currentConversation.messages.slice(-10) : [];
        const aiResponse = await getSingleBestieResponse(text, personaName, history, language, userProfile, personaInterests);
        
        const delay = calculateTypingDelay(aiResponse.text);
        setTimeout(() => {
             setConversations(prev => ({
                ...prev,
                [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, { ...aiResponse, timestamp: Date.now() }] }
            }));
            clearLoadingTimeout();
            setIsLoading(false);
        }, delay);
      }
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { sender: 'System', text: 'Sorry, there was an error. Please try again later.', timestamp: Date.now() };
      setConversations(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, errorMessage] }
      }));
      clearLoadingTimeout();
      setIsLoading(false);
    }
  }, [language, userProfile, conversations, clearLoadingTimeout, personaInterests]);

  const handleGenerateDiary = useCallback(async (chatId: ConversationID) => {
    if (!userProfile) return;
    const conversation = conversations[chatId];
    if (!conversation || conversation.messages.length < 2) return;
    setIsLoading(true);
    const userMessages = conversation.messages.filter(msg => msg.sender === 'Me');
    try {
        const diaryEntry = await generateDiaryEntry(userMessages, language, userProfile);
        setDiaryEntries(prev => [diaryEntry, ...prev]);
        setActiveView('diary');
    } catch (error) {
        console.error("Failed to generate diary entry:", error);
    } finally {
        setIsLoading(false);
    }
  }, [conversations, language, userProfile]);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const handleExportData = () => {
    const data: CombinedData = {
        userProfile,
        conversations,
        diaryEntries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `besties_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const onFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const data: CombinedData = JSON.parse(result);
                if (data.userProfile && data.conversations && Array.isArray(data.diaryEntries)) {
                    if (!data.userProfile.keyMemories) {
                        data.userProfile.keyMemories = {};
                    }

                    const importedConversations = data.conversations;
                    // Ensure group chat exists after import to prevent crashes
                    if (!importedConversations.group) {
                        importedConversations.group = {
                            id: 'group',
                            name: '闺蜜团 (Group Chat)',
                            messages: [{ sender: 'System', text: "Welcome back! Your besties missed you.", timestamp: Date.now() }],
                            isGroup: true,
                        };
                    }

                    setUserProfile(data.userProfile);
                    setConversations(importedConversations);
                    setDiaryEntries(data.diaryEntries);
                    setActiveChatId('group');
                    setActiveView('chats');
                    alert('Data imported successfully!');
                } else {
                    throw new Error("Invalid data structure in file.");
                }
            }
        } catch (error) {
            console.error("Failed to import data:", error);
            alert("Failed to import data. Please check the file format.");
        }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = '';
  };

  const activeConversation = conversations[activeChatId];

  if (!userProfile) {
    return <OnboardingModal onSave={handleSaveProfile} />;
  }
  
  const renderMainView = () => {
    switch(activeView) {
        case 'chats':
             return activeConversation ? (
                <ChatWindow
                  key={activeChatId}
                  conversation={activeConversation}
                  onSendMessage={handleSendMessage}
                  onGenerateDiary={handleGenerateDiary}
                  isLoading={isLoading}
                />
              ) : (
                 <div className="flex-1 flex items-center justify-center text-center text-[var(--text-color-secondary)]">
                    <p>Select a chat to start messaging</p>
                </div>
              );
        case 'diary':
            return <DiaryView entries={diaryEntries} />;
        default:
            return <div />;
    }
  }

  return (
    <LocalizationContext.Provider value={{ t, setLanguage, language }}>
      <div className="flex h-screen bg-[var(--ui-bg)] text-[var(--text-color-primary)] backdrop-blur-xl font-sans">
        
        <div className="flex flex-col flex-shrink-0 w-full md:w-[25rem] lg:w-[28rem] border-r border-[var(--ui-border)]">
           <TopBar 
                theme={theme} 
                setTheme={setTheme}
                onExport={handleExportData}
                onImport={handleImportData}
                onEditProfile={() => setProfileModalOpen(true)}
            />
           <div className="flex flex-grow overflow-hidden">
              <Sidebar activeView={activeView} setActiveView={setActiveView} />
              <div className="flex-1 overflow-hidden">
                {activeView === 'chats' || activeView === 'diary' ? (
                  <ChatList
                    conversations={Object.values(conversations)}
                    activeChatId={activeChatId}
                    onSelectChat={(id) => {
                        setActiveChatId(id);
                        setActiveView('chats');
                    }}
                    onCloseChat={handleCloseChat}
                  />
                ) : (
                  <ContactsView onSelectPersona={setProfileCardPersona} />
                )}
              </div>
           </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {renderMainView()}
        </div>
        
        {profileCardPersona && (
          <ProfileCard 
            persona={PERSONAS[profileCardPersona]} 
            onClose={() => setProfileCardPersona(null)}
            onStartChat={startPrivateChat}
          />
        )}
        {isProfileModalOpen && (
          <ProfileModal
            userProfile={userProfile}
            onSave={(updatedProfile) => {
                setUserProfile(updatedProfile);
                setProfileModalOpen(false);
            }}
            onClose={() => setProfileModalOpen(false)}
          />
        )}
        <input type="file" accept=".json" ref={fileInputRef} onChange={onFileImport} style={{ display: 'none' }} />
      </div>
    </LocalizationContext.Provider>
  );
};

export default App;
