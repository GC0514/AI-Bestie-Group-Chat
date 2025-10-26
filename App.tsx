
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import type { ChatMessage, Conversation, ConversationID, PersonaName, Theme, Language, UserProfile, DiaryEntry, CombinedData, PersonaInterests, RegenerationSource } from './types';
import { getBestiesResponse, getSingleBestieResponse, generateDiaryEntry as generateDiaryEntryService, getProactiveGreeting, extractMemories } from './services/geminiService';
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
import RegenerateDiaryModal from './components/RegenerateDiaryModal';

export const LocalizationContext = React.createContext({
  t: (key: string) => locales.en[key] || key,
  setLanguage: (lang: Language) => {},
  language: 'en' as Language,
});

// Helper to simulate typing delay
const calculateTypingDelay = (text: string): number => {
    const baseDelay = 300; // Minimum delay
    const perCharDelay = 50; // ms per character
    return baseDelay + (text.length * perCharDelay);
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


const AppContent: React.FC = () => {
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
  const { language } = useContext(LocalizationContext);
  const [activeView, setActiveView] = useState<'chats' | 'contacts' | 'diary'>('chats');
  const [profileCardPersona, setProfileCardPersona] = useState<PersonaName | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isRegenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [diaryToRegenerate, setDiaryToRegenerate] = useState<DiaryEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        loadingTimeoutRef.current = setTimeout(() => {
            console.error("Watchdog timeout triggered during proactive greeting. Forcing loading to false.");
            setIsLoading(false);
        }, 35000);

        try {
            const recentUserMessages = groupMessages.filter(m => m.sender === 'Me').slice(-5);
            const recentDiaryEntry = diaryEntries.length > 0 ? diaryEntries[0] : null;

            if (recentUserMessages.length === 0 && !recentDiaryEntry) {
                clearLoadingTimeout();
                setIsLoading(false);
                return;
            }

            const context = { recentUserMessages, recentDiaryEntry, userProfile };
            
            const greetings = await getProactiveGreeting(context, language);
            
            clearLoadingTimeout();
            setIsLoading(false);

            if (greetings.length === 0) {
              return;
            }
            
            let cumulativeDelay = 0;
            greetings.forEach((greeting) => {
                const thinkingPause = Math.random() * 2000 + 800;
                cumulativeDelay += thinkingPause;

                setTimeout(() => {
                    setConversations(prev => {
                        const groupChat = prev.group;
                        if (!groupChat) return prev;
                        return {
                            ...prev,
                            group: { ...groupChat, messages: [...groupChat.messages, { ...greeting, timestamp: Date.now() }] }
                        };
                    });
                }, cumulativeDelay);
            });

        } catch (e) {
            console.error("Failed to get proactive greeting:", e);
            clearLoadingTimeout();
            setIsLoading(false); 
        }
    };

    const timer = setTimeout(handleProactiveGreeting, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, userProfile]); 


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
    }, 35000);

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
        
        clearLoadingTimeout();
        setIsLoading(false);
        
        let cumulativeDelay = 0;
        aiResponses.forEach((res) => {
            const thinkingPause = Math.random() * 1800 + 500; // 0.5s to 2.3s pause before this message appears
            cumulativeDelay += thinkingPause;
            
            setTimeout(() => {
                setConversations(prev => ({
                ...prev,
                [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, { ...res, timestamp: Date.now() }] }
                }));
            }, cumulativeDelay);
        });

      } else {
        const personaName = chatId as PersonaName;
        const currentConversation = conversations[chatId];
        const history = currentConversation ? currentConversation.messages.slice(-10) : [];
        const aiResponse = await getSingleBestieResponse(text, personaName, history, language, userProfile, personaInterests);
        
        clearLoadingTimeout();
        setIsLoading(false);

        const delay = calculateTypingDelay(aiResponse.text);
        setTimeout(() => {
             setConversations(prev => ({
                ...prev,
                [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, { ...aiResponse, timestamp: Date.now() }] }
            }));
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
        const { title, content } = await generateDiaryEntryService(userMessages, language, userProfile);
        const newEntry: DiaryEntry = {
            date: new Date().toISOString().split('T')[0],
            title,
            content,
            sourceChatId: chatId, // Store the source of the diary entry
        };
        setDiaryEntries(prev => [newEntry, ...prev]);
        setActiveView('diary');
    } catch (error) {
        console.error("Failed to generate diary entry:", error);
    } finally {
        setIsLoading(false);
    }
  }, [conversations, language, userProfile]);
  
  const handleRegenerateDiary = useCallback(async (entryToRegen: DiaryEntry, source: RegenerationSource) => {
    if (!userProfile) return;
    setRegenerateModalOpen(false);
    setIsLoading(true);

    let messagesToProcess: ChatMessage[] = [];
    if (source === 'original' && entryToRegen.sourceChatId) {
        messagesToProcess = conversations[entryToRegen.sourceChatId]?.messages.filter(m => m.sender === 'Me') || [];
    } else if (source === 'group') {
        messagesToProcess = conversations.group?.messages.filter(m => m.sender === 'Me') || [];
    } else if (source === 'all') {
        Object.values(conversations).forEach(convo => {
            if (convo) {
                messagesToProcess.push(...convo.messages.filter(m => m.sender === 'Me'));
            }
        });
    }

    if (messagesToProcess.length === 0) {
        console.warn("No user messages found for regeneration source:", source);
        setIsLoading(false);
        return;
    }

    try {
        const { title, content } = await generateDiaryEntryService(messagesToProcess, language, userProfile);
        setDiaryEntries(prev => prev.map(entry => 
            entry.date === entryToRegen.date && entry.title === entryToRegen.title
            ? { ...entry, title, content } // Update content and title, keep original date and source
            : entry
        ));
    } catch (error) {
        console.error("Failed to regenerate diary entry:", error);
    } finally {
        setIsLoading(false);
    }
  }, [userProfile, language, conversations]);


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
  
  const openRegenerateModal = (entry: DiaryEntry) => {
    setDiaryToRegenerate(entry);
    setRegenerateModalOpen(true);
  };

  const activeConversation = conversations[activeChatId];
  
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
            return <DiaryView entries={diaryEntries} onRegenerate={openRegenerateModal} />;
        default:
            return <div />;
    }
  }

  if (!userProfile) {
    return <OnboardingModal onSave={handleSaveProfile} />;
  }

  return (
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
      {isRegenerateModalOpen && diaryToRegenerate && (
          <RegenerateDiaryModal
              entry={diaryToRegenerate}
              onClose={() => setRegenerateModalOpen(false)}
              onRegenerate={handleRegenerateDiary}
          />
      )}
      <input type="file" accept=".json" ref={fileInputRef} onChange={onFileImport} style={{ display: 'none' }} />
    </div>
  );
};


const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('zh');

    const t = useCallback((key: string) => {
        return locales[language][key] || locales['en'][key] || key;
    }, [language]);

    return (
        <LocalizationContext.Provider value={{ t, setLanguage, language }}>
            <AppContent />
        </LocalizationContext.Provider>
    );
};

export default App;