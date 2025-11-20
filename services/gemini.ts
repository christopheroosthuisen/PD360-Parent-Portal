import { GoogleGenAI } from "@google/genai";

export const generateContent = async (
  prompt: string,
  model: string = "gemini-2.5-flash",
  systemInstruction?: string,
  media?: { mimeType: string; data: string }
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return "I'm currently unable to access the PD360 knowledge base (Missing API Key).";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const parts: any[] = [];
    
    if (media) {
      parts.push({
        inlineData: {
          mimeType: media.mimeType,
          data: media.data
        }
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a response based on the provided input. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the Gemini service right now. Please try again later.";
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      },
    });

    // Iterate to find image part
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

// Backward compatibility wrapper if needed, but we will update calls sites.
export const callGemini = async (userQuery: string, systemInstruction: string = "") => {
  return generateContent(userQuery, "gemini-2.5-flash", systemInstruction);
};