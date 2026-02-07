
import { GoogleGenAI, Type } from "@google/genai";

export const getMovieMetadata = async (input: string, existingCategories: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract movie details from this input: "${input}". 
      If it's a YouTube URL, try to identify what the movie/video is about. 
      If it's just a title, provide a professional movie description.
      Suggest a category. Try to pick from these existing ones if they fit: ${existingCategories.join(', ')}, otherwise suggest a new single-word category.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              description: "The movie category." 
            },
          },
          required: ["title", "description", "category"]
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
