import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, PersonaName, Language, UserProfile } from '../types';
import { getSystemPromptGroup, getSystemPromptSingle } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

export async function getBestiesResponse(userMessage: string, lang: Language, userProfile: UserProfile): Promise<ChatMessage[]> {
  try {
    const prompt = `The user, ${userProfile.nickname}, says: "${userMessage}". Generate the responses from the 8 AI personas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemPromptGroup(lang, userProfile),
        responseMimeType: "application/json",
        responseSchema: groupResponseSchema,
      }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (Array.isArray(parsedResponse)) {
      return parsedResponse as ChatMessage[];
    } else {
      throw new Error("Invalid response format from API for group chat.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from AI besties.");
  }
}

export async function getSingleBestieResponse(userMessage: string, personaName: PersonaName, lang: Language, userProfile: UserProfile): Promise<ChatMessage> {
    try {
        const prompt = `${userProfile.nickname} says: "${userMessage}". Generate your response.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: getSystemPromptSingle(personaName, lang, userProfile),
                responseMimeType: "application/json",
                responseSchema: singleResponseSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
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
