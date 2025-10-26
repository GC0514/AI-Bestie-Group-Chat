export type PersonaName = '苏默' | '元气小桃' | '林溪' | '江晚' | '星野' | '楚菲' | '顾盼' | '哈哈酱';

export type UserOrSystem = 'Me' | 'System';

export interface ChatMessage {
  sender: PersonaName | UserOrSystem;
  text: string;
  timestamp?: number;
}

export interface Persona {
  name: PersonaName;
  color: string;
  description: string;
  age: number;
  detailedDescription: string;
  avatar: string; // URL to an image
  tags: string[];
  zodiac: string;
  mbti: string;
  quote: string;
  occupation: string;
  hobbies: string[];
  favoriteFood: string;
}

export type ConversationID = PersonaName | 'group';

export interface Conversation {
    id: ConversationID;
    name: string;
    messages: ChatMessage[];
    isGroup: boolean;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'zh';

export type LocaleStrings = {
    [key: string]: string;
};

export interface UserProfile {
  nickname: string;
  description: string;
  zodiac: string;
  mbti: string;
  tags: string[];
  keyMemories?: Record<string, string[]>; // For dynamic memory
}

export interface DiaryEntry {
    date: string;
    title: string;
    content: string;
}

export interface CombinedData {
    userProfile: UserProfile | null;
    conversations: Partial<Record<ConversationID, Conversation>>;
    diaryEntries: DiaryEntry[];
}

export interface ProactiveContext {
    recentUserMessages: ChatMessage[];
    recentDiaryEntry: DiaryEntry | null;
    userProfile: UserProfile;
}

export type PersonaInterests = Partial<Record<PersonaName, string[]>>;
