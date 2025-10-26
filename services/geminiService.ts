
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { ChatMessage, PersonaName, Language, UserProfile, DiaryEntry, ProactiveContext, PersonaInterests } from '../types';
import { 
  getSystemPromptGroup, 
  getSystemPromptSingle, 
  getSystemPromptDiary, 
  getSystemPromptProactiveGreeting,
  getSystemPromptMemoryExtraction
} from '../prompts/systemPrompts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const API_TIMEOUT = 30000; // 30 seconds

// A helper function to wrap promises with a timeout
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]);
};


const groupResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      sender: { type: Type.STRING },
      text: { type: Type.STRING },
    },
    required: ["sender", "text"],
  },
};

const singleResponseSchema = {
    type: Type.OBJECT,
    properties: {
        sender: { type: Type.STRING },
        text: { type: Type.STRING },
    },
    required: ["sender", "text"],
};

const diaryResponseSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.STRING },
    },
    required: ["date", "title", "content"],
};

const memoryExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        food: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "User's favorite or mentioned foods and drinks."
        },
        music: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "User's favorite or mentioned music artists, songs, or genres."
        },
        movies_tv: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "User's favorite or mentioned movies, TV shows, or anime."
        },
        books: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "User's favorite or mentioned books or authors."
        },
        hobbies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "User's explicitly mentioned hobbies."
        },
        life_events: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Recent or upcoming significant life events for the user."
        },
        personal_facts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Objective facts about the user."
        }
    },
};


export async function getBestiesResponse(userMessage: string, lang: Language, userProfile: UserProfile, personaInterests: PersonaInterests): Promise<ChatMessage[]> {
  try {
    const prompt = `The user, ${userProfile.nickname}, says: "${userMessage}". Generate responses from the AI personas based on the new dynamic rules.`;

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemPromptGroup(lang, userProfile, personaInterests),
        responseMimeType: "application/json",
        responseSchema: groupResponseSchema,
      }
    }), API_TIMEOUT);

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (Array.isArray(parsedResponse)) {
      return parsedResponse as ChatMessage[];
    } else {
      console.warn("Group response was not an array, returning empty.", parsedResponse);
      return [];
    }
  } catch (error) {
    console.error("Error calling Gemini API for group response:", error);
    throw new Error("Failed to get response from AI besties.");
  }
}

export async function getSingleBestieResponse(userMessage: string, personaName: PersonaName, history: ChatMessage[], lang: Language, userProfile: UserProfile, personaInterests: PersonaInterests): Promise<ChatMessage> {
    const prompt = `Here is the recent chat history for context:\n${history.map(m => `${m.sender}: ${m.text}`).join('\n')}\n\n${userProfile.nickname} (Me) says: "${userMessage}".\n\nNow, generate your response as ${personaName}.`;
    
    try {
        const response = await withTimeout(ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: getSystemPromptSingle(personaName, lang, userProfile, personaInterests),
                responseMimeType: "application/json",
                responseSchema: singleResponseSchema,
            }
        }), API_TIMEOUT);

        const jsonText = response.text.trim();
        let parsedResponse;

        try {
            parsedResponse = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse single bestie response JSON:", parseError);
            console.error("Original non-JSON response:", jsonText);
            throw new Error(`Received an invalid response from ${personaName}.`);
        }
        
        if (parsedResponse && typeof parsedResponse.sender === 'string' && typeof parsedResponse.text === 'string') {
             return parsedResponse as ChatMessage;
        } else {
             throw new Error("Invalid response format from API for single chat.");
        }
    } catch (error) {
        console.error(`Error calling Gemini API for ${personaName}:`, error);
        throw new Error(`Failed to get response from ${personaName}.`);
    }
}

export async function generateDiaryEntry(userMessages: ChatMessage[], lang: Language, userProfile: UserProfile): Promise<DiaryEntry> {
    try {
        const userChatHistory = userMessages.map(msg => msg.text).join('\n');
        const prompt = `Here are the user's recent thoughts:\n---\n${userChatHistory}\n---\nBased on these, please write a diary entry.`;

        const response = await withTimeout(ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: getSystemPromptDiary(lang, userProfile),
                responseMimeType: "application/json",
                responseSchema: diaryResponseSchema,
            }
        }), API_TIMEOUT);

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (parsedResponse && parsedResponse.date && parsedResponse.title && parsedResponse.content) {
            return parsedResponse as DiaryEntry;
        } else {
            throw new Error("Invalid diary format from API.");
        }

    } catch (error) {
        console.error("Error generating diary entry:", error);
        throw new Error("Failed to generate diary entry.");
    }
}

export async function getProactiveGreeting(context: ProactiveContext, lang: Language): Promise<ChatMessage[]> {
  try {
    let contextSummary = `Here is the user's recent activity:\n`;
    if (context.recentDiaryEntry) {
        contextSummary += `\n[Latest Diary Entry: "${context.recentDiaryEntry.title}"]\n${context.recentDiaryEntry.content.substring(0, 200)}...\n`;
    }
    if (context.recentUserMessages.length > 0) {
        const messageHistory = context.recentUserMessages.map(m => m.text).join('\n - ');
        contextSummary += `\n[Recent Chat Messages]\n - ${messageHistory}\n`;
    }
    contextSummary += `\nIt's a new day/session. Please generate some caring greetings based on this context.`;
    
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextSummary,
      config: {
        systemInstruction: getSystemPromptProactiveGreeting(lang, context.userProfile),
        responseMimeType: "application/json",
        responseSchema: groupResponseSchema,
      }
    }), API_TIMEOUT);

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (Array.isArray(parsedResponse)) {
      return parsedResponse as ChatMessage[];
    } else {
      console.warn("Proactive greeting response was not an array, returning empty.", parsedResponse);
      return [];
    }
  } catch (error) {
    console.error("Error calling Gemini API for proactive greeting:", error);
    return []; // Fail silently
  }
}


export async function extractMemories(userMessage: string, lang: Language): Promise<Record<string, string[]>> {
    try {
        const response = await withTimeout(ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: getSystemPromptMemoryExtraction(lang),
                responseMimeType: "application/json",
                responseSchema: memoryExtractionSchema,
                temperature: 0.0,
            }
        }), API_TIMEOUT);

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
            return parsedResponse as Record<string, string[]>;
        }
        return {};

    } catch (error) {
        console.error("Error extracting memories:", error);
        return {}; // Fail silently
    }
}
