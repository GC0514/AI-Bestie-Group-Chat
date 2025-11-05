

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import type { ChatMessage, Conversation, ConversationID, PersonaName, Theme, Language, UserProfile, DiaryEntry, CombinedData, PersonaInterests, RegenerationSource, View, Pact, Moment } from './types';
import { getBestiesResponse, getSingleBestieResponse, generateDiaryEntry as generateDiaryEntryService, getProactiveGreeting, extractMemories, generateMoment, extractPact } from './services/geminiService';
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
import BottomNavBar from './components/BottomNavBar';
import MeView from './components/MeView';
import MomentsView from './components/MomentsView';
import MemoryView from './components/MemoryView';


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

  const [moments, setMoments] = useState<Moment[]>(() => {
    try {
      const savedMoments = localStorage.getItem('moments');
      return savedMoments ? JSON.parse(savedMoments) : [];
    } catch (error) {
      console.error("Failed to load moments from localStorage", error);
      return [];
    }
  });

  const [personaInterests, setPersonaInterests] = useState<PersonaInterests>({});
  const [activeChatId, setActiveChatId] = useState<ConversationID | null>('group');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const { language, t } = useContext(LocalizationContext);
  const [activeView, setActiveView] = useState<View>('chats');
  const [profileCardPersona, setProfileCardPersona] = useState<PersonaName | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isRegenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [diaryToRegenerate, setDiaryToRegenerate] = useState<DiaryEntry | null>(null);
  const [isDiaryViewOpen, setIsDiaryViewOpen] = useState(false);
  const [isMemoryViewOpen, setIsMemoryViewOpen] = useState(false);
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

  // All localStorage useEffects
  useEffect(() => {
    try { localStorage.setItem('conversations', JSON.stringify(conversations)); } 
    catch (e) { console.error("Failed to save conversations", e); }
  }, [conversations]);

  useEffect(() => {
    try { if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile)); }
    catch (e) { console.error("Failed to save user profile", e); }
  }, [userProfile]);

  useEffect(() => {
    try { localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries)); }
    catch (e) { console.error("Failed to save diary entries", e); }
  }, [diaryEntries]);

  useEffect(() => {
    try { localStorage.setItem('moments', JSON.stringify(moments)); }
    catch (e) { console.error("Failed to save moments", e); }
  }, [moments]);

  // Proactive Greeting
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

  // Generate Moments daily
  useEffect(() => {
    const generateDailyMoments = async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastGenerated = localStorage.getItem('momentsLastGenerated');
        if (lastGenerated === today || !userProfile) return;

        console.log("Generating daily moments...");
        const personaNames = Object.keys(PERSONAS) as PersonaName[];
        const shuffled = personaNames.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 2); // 2 to 4 moments

        const newMomentsPromises = selected.map(async (pName) => {
            const content = await generateMoment(pName, language);
            if (!content) return null;
            return {
                id: `${Date.now()}-${pName}`,
                personaName: pName,
                content: content,
                timestamp: Date.now() - Math.random() * 86400000, // Post at a random time in the last 24h
            };
        });

        const results = (await Promise.all(newMomentsPromises)).filter((m): m is Moment => m !== null);
        if (results.length > 0) {
          setMoments(prev => [...results, ...prev].sort((a,b) => b.timestamp - a.timestamp).slice(0, 50));
        }
        localStorage.setItem('momentsLastGenerated', today);
    };
    const timer = setTimeout(generateDailyMoments, 3000); // Generate after 3s delay
    return () => clearTimeout(timer);
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
    setIsChatOpen(true);
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


  const handleSendMessage = useCallback(async (text: string, chatId: ConversationID | null) => {
    if (!text.trim() || !userProfile || !chatId) return;
    
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
        setConversations(prev => {
            const currentConvo = prev[chatId];
            if (!currentConvo) {
                console.warn(`Attempted to add timeout message to a non-existent conversation with ID: ${chatId}`);
                return prev;
            }
            return {
                ...prev,
                [chatId]: { ...currentConvo, messages: [...currentConvo.messages, errorMessage] }
            };
        });
    }, 35000);

    // Side-effects: memory and pact extraction (no need to await)
    extractMemories(text, language).then(newMemories => {
        if (Object.keys(newMemories).length > 0) {
            setUserProfile(prevProfile => {
                if (!prevProfile) return null;
                const updatedMemories = mergeMemories(prevProfile.keyMemories || {}, newMemories);
                return { ...prevProfile, keyMemories: updatedMemories };
            });
        }
    }).catch(error => { console.error("Failed to extract memories:", error); });
    
    extractPact(text, language).then(pact => {
        if(pact) {
            const pactMessage: ChatMessage = { sender: 'System', text: `Got it, I'll remember: ${pact.content}`, timestamp: Date.now() };
            setConversations(prev => ({
                ...prev,
                [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!.messages, pactMessage] }
            }));
        }
    }).catch(error => { console.error("Failed to extract pact:", error); });


    try {
      if (chatId === 'group') {
        const aiResponses = await getBestiesResponse(text, language, userProfile, personaInterests);
        
        clearLoadingTimeout();
        setIsLoading(false);
        
        let cumulativeDelay = 0;
        aiResponses.forEach((res) => {
            const thinkingPause = Math.random() * 1800 + 500;
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
                [chatId]: { ...prev[chatId]!, messages: [...prev[chatId]!, { ...aiResponse, timestamp: Date.now() }] }
            }));
        }, delay);
      }
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { sender: 'System', text: 'Sorry, there was an error. Please try again later.', timestamp: Date.now() };
      setConversations(prev => {
        const currentConvo = prev[chatId];
        if (!currentConvo) {
            console.warn(`Attempted to add error message to a non-existent conversation with ID: ${chatId}`);
            return prev;
        }
        return {
          ...prev,
          [chatId]: { ...currentConvo, messages: [...currentConvo.messages, errorMessage] }
        };
      });
      clearLoadingTimeout();
      setIsLoading(false);
    }
  }, [language, userProfile, conversations, clearLoadingTimeout, personaInterests]);

  const handleReaction = (chatId: ConversationID, messageTimestamp: number, emoji: string) => {
    setConversations(prev => {
        const newConversations = { ...prev };
        const convo = newConversations[chatId];
        if (convo) {
            const messageIndex = convo.messages.findIndex(m => m.timestamp === messageTimestamp);
            if (messageIndex !== -1) {
                const updatedMessages = [...convo.messages];
                updatedMessages[messageIndex] = {
                    ...updatedMessages[messageIndex],
                    userReaction: emoji,
                };
                newConversations[chatId] = { ...convo, messages: updatedMessages };
            }
        }
        return newConversations;
    });
  };

  const handleGenerateDiary = useCallback(async (chatId: ConversationID | null) => {
    if (!userProfile || !chatId) return;
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
        setIsDiaryViewOpen(true);
        setActiveView('me');
        setIsChatOpen(false);
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
        // FIX: The `for...of` loop cannot iterate directly over an object. `Object.values()` must be used to get an array of the conversations.
        for (const convo of Object.values(conversations)) {
            if (convo) {
                messagesToProcess.push(...convo.messages.filter(m => m.sender === 'Me'));
            }
        }
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
            ? { ...entry, title, content }
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
    const data: CombinedData = { userProfile, conversations, diaryEntries };
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
                            id: 'group', name: '闺蜜团 (Group Chat)',
                            messages: [{ sender: 'System', text: "Welcome back! Your besties missed you.", timestamp: Date.now() }], isGroup: true,
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

  const activeConversation = activeChatId ? conversations[activeChatId] : null;

  const renderMobileView = () => {
    if (isChatOpen && activeConversation) {
        return (
            <ChatWindow
              key={activeChatId}
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
              onGenerateDiary={handleGenerateDiary}
              onReact={handleReaction}
              isLoading={isLoading}
              onBack={() => setIsChatOpen(false)}
            />
        );
    }
    if (isDiaryViewOpen) {
      return <DiaryView entries={diaryEntries} onRegenerate={openRegenerateModal} onBack={() => setIsDiaryViewOpen(false)} />;
    }
    if (isMemoryViewOpen) {
      return <MemoryView userProfile={userProfile!} setUserProfile={setUserProfile} onBack={() => setIsMemoryViewOpen(false)} />;
    }

    switch (activeView) {
      case 'chats':
        return (
          <ChatList
            conversations={Object.values(conversations)}
            activeChatId={activeChatId}
            onSelectChat={(id) => { setActiveChatId(id); setIsChatOpen(true); }}
            onCloseChat={handleCloseChat}
          />
        );
      case 'moments':
        return <MomentsView moments={moments} />;
      case 'contacts':
        return <ContactsView onSelectPersona={setProfileCardPersona} />;
      case 'me':
        return (
          <MeView
            userProfile={userProfile}
            onEditProfile={() => setProfileModalOpen(true)}
            onShowDiary={() => setIsDiaryViewOpen(true)}
            onShowMemories={() => setIsMemoryViewOpen(true)}
            theme={theme}
            setTheme={setTheme}
            onExport={handleExportData}
            onImport={handleImportData}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      {!userProfile && <OnboardingModal onSave={handleSaveProfile} />}
      {userProfile && (
        <div className="flex h-full bg-[var(--ui-bg)] text-[var(--text-color-primary)] backdrop-blur-xl font-sans">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col flex-shrink-0 w-full md:w-[25rem] lg:w-[28rem] border-r border-[var(--ui-border)]">
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
                  {activeView === 'chats' ? (
                    <ChatList
                      conversations={Object.values(conversations)}
                      activeChatId={activeChatId}
                      onSelectChat={(id) => { setActiveChatId(id); }}
                      onCloseChat={handleCloseChat}
                    />
                  ) : activeView === 'contacts' ? (
                     <ContactsView onSelectPersona={setProfileCardPersona} />
                  ): activeView === 'diary' ? (
                    <DiaryView entries={diaryEntries} onRegenerate={openRegenerateModal} />
                  ) : (
                    <MomentsView moments={moments} />
                  )}
                </div>
            </div>
          </div>
          <div className="hidden md:flex flex-1 flex-col">
            {activeConversation ? (
                <ChatWindow
                  key={activeChatId}
                  conversation={activeConversation}
                  onSendMessage={handleSendMessage}
                  onGenerateDiary={handleGenerateDiary}
                  onReact={handleReaction}
                  isLoading={isLoading}
                />
              ) : (
                 <div className="flex-1 flex items-center justify-center text-center text-[var(--text-color-secondary)]">
                    <p>Select a chat to start messaging</p>
                </div>
              )}
          </div>
          
           {/* Mobile Layout */}
          <div className="md:hidden flex flex-col w-full h-full">
            <main className="flex-1 overflow-y-auto pb-16">
              {renderMobileView()}
            </main>
            {!isChatOpen && !isDiaryViewOpen && !isMemoryViewOpen && <BottomNavBar activeView={activeView} setActiveView={setActiveView} />}
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
      )}
    </>
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