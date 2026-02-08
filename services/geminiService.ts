
import { GoogleGenAI, Type } from "@google/genai";
import { ROOT_LANGUAGES } from "../types";

export const getMovieMetadata = async (input: string, existingCategories: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract movie details from: "${input}". 
      
      REQUIREMENTS:
      1. Detect Language: Choose from ${ROOT_LANGUAGES.join(', ')}. Look for specific characters (e.g., Chinese) or context.
      2. Suggest Genre: Pick from ${existingCategories.join(', ')} or suggest a new one.
      3. Return a professional title and summary.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            language: { 
              type: Type.STRING, 
              description: "Must be one of the root languages provided." 
            },
            category: { 
              type: Type.STRING, 
              description: "The movie sub-genre (in English, app will localize)." 
            },
          },
          required: ["title", "description", "language", "category"]
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
