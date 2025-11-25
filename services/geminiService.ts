
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Language, ResourceItem, ResourceCategory } from "../types";

// Helper to get fresh client with current env key
// We create the client dynamically to ensure it picks up the API key 
// if it is injected via window.aistudio after the app loads.
const getClient = () => {
    const apiKey = process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey });
};

// System instruction based on selected language and context
const getSystemInstruction = (language: Language): string => {
  let instruction = "You are GrameenSahayak, a helpful, empathetic, and simple-speaking digital assistant for rural communities. ";
  
  if (language === Language.HINDI) {
    instruction += "Reply in Hindi (using Devanagari script). ";
  } else if (language === Language.TELUGU) {
    instruction += "Reply in Telugu. ";
  } else if (language === Language.TAMIL) {
    instruction += "Reply in Tamil. ";
  } else if (language === Language.MALAYALAM) {
    instruction += "Reply in Malayalam. ";
  } else {
    instruction += "Reply in simple, plain English suitable for non-native speakers. ";
  }

  instruction += "Your goal is to help users understand digital concepts (like UPI payments, online banking, telehealth), government schemes, and agricultural market prices. Keep answers short, practical, and encouraging. Avoid complex technical jargon.";
  
  return instruction;
};

let chatSession: Chat | null = null;
let currentLang: Language = Language.ENGLISH;

export const initializeChat = (language: Language) => {
  currentLang = language;
  const ai = getClient();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(language),
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });
};

export const sendMessageToGemini = async (message: string, language: Language): Promise<string> => {
  try {
    // Re-initialize if language changed or session doesn't exist
    if (!chatSession || currentLang !== language) {
      initializeChat(language);
    }

    if (!chatSession) throw new Error("Failed to initialize chat session");

    const response: GenerateContentResponse = await chatSession.sendMessage({
      message: message
    });

    return response.text || "I'm sorry, I couldn't understand that. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Force re-initialization on next attempt in case key was missing and is now added
    chatSession = null;
    return "Offline mode: Unable to connect to the assistant. Please check your internet connection or ensure API Key is enabled.";
  }
};

export const getRecommendations = async (userProfile: string): Promise<string[]> => {
    try {
        const ai = getClient();
        const prompt = `Based on this user profile: "${userProfile}", suggest 3 short, specific topics they should learn next. Return ONLY a JSON array of strings. Example: ["How to open bank account", "Crop price checking", "Vaccination schedule"]`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as string[];
    } catch (e) {
        console.error("Recommendation Error", e);
        return ["Digital Payments Basics", "Government ID Schemes", "Weather Apps for Farming"];
    }
}

// Function to fetch real-time resources from the web using Search Grounding
export const fetchWebResources = async (language: Language): Promise<ResourceItem[]> => {
  const ai = getClient();
  const prompt = `Find 4 currently active and important government schemes, apps, or digital services for rural India, relevant to speakers of ${language}.
  Focus on Agriculture, Finance, Health, or Education.
  
  Strictly output the results in the following format for each item. Do not use markdown (like **bold**).
  
  ---
  Title: [Name of the scheme/app]
  Description: [A clear, 1-sentence explanation of what it does]
  Category: [Must be one of: Agriculture, Finance, Healthcare, Education, Government]
  Link: [Official website URL if found, otherwise write 'NA']
  ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // Enable Search Grounding
      }
    });

    const text = response.text;
    if (!text) return [];

    // Parse the text response
    const items: ResourceItem[] = [];
    const chunks = text.split('---').filter(c => c.trim().length > 10);

    chunks.forEach((chunk, index) => {
      const titleMatch = chunk.match(/Title:\s*(.+)/);
      const descMatch = chunk.match(/Description:\s*(.+)/);
      const catMatch = chunk.match(/Category:\s*(.+)/);
      const linkMatch = chunk.match(/Link:\s*(.+)/);

      if (titleMatch && descMatch) {
        let categoryStr = catMatch ? catMatch[1].trim() : 'Government';
        // Map string to Enum
        let category = ResourceCategory.GOVERNMENT;
        if (categoryStr.includes('Agri')) category = ResourceCategory.AGRICULTURE;
        else if (categoryStr.includes('Fin')) category = ResourceCategory.FINANCE;
        else if (categoryStr.includes('Health')) category = ResourceCategory.HEALTH;
        else if (categoryStr.includes('Edu')) category = ResourceCategory.EDUCATION;

        items.push({
          id: `web-${Date.now()}-${index}`,
          title: titleMatch[1].trim(),
          description: descMatch[1].trim(),
          category: category,
          icon: 'Globe', // Custom icon for web items
          offlineAvailable: false,
          downloadStatus: 'idle',
          progress: 0,
          link: linkMatch && linkMatch[1].trim() !== 'NA' ? linkMatch[1].trim() : undefined
        });
      }
    });

    return items;

  } catch (error) {
    console.error("Fetch Web Resources Error:", error);
    return [];
  }
};

export const generateLessonContent = async (topic: string, language: Language): Promise<string> => {
    const ai = getClient();
    let prompt = `Create a simple, educational lesson about "${topic}". 
    The audience is a rural villager in India with low digital literacy.
    Structure it with:
    1. Introduction (What is it?)
    2. Benefits (Why use it?)
    3. Step-by-Step Guide (How to do it?)
    4. Safety Tips (What to be careful about?)
    
    Use clear headings and bullet points.`;

    if (language === Language.HINDI) prompt += " Write the response in Hindi.";
    else if (language === Language.TELUGU) prompt += " Write the response in Telugu.";
    else if (language === Language.TAMIL) prompt += " Write the response in Tamil.";
    else if (language === Language.MALAYALAM) prompt += " Write the response in Malayalam.";
    else prompt += " Write the response in simple English.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Content generation failed. Please try again.";
    } catch (e) {
        console.error("Lesson Generation Error", e);
        return "We are unable to generate the lesson at this moment. Please check your internet connection.";
    }
};
