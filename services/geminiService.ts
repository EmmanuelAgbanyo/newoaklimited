
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are a sophisticated AI concierge for 'NewOak Limited', a premium real estate company in Accra, Ghana. 
Your tone is professional, helpful, and exclusive. 

Operational Protocol:
- ALWAYS respond in clean, natural, and professional prose.
- DO NOT use markdown formatting such as asterisks (**bold**), hashtags (#), or bullet points (* item). 
- If you need to list items, use clear sentences or simple numbered lists (1. 2. 3.).
- Use the googleMaps tool for accurate amenity information in Haatso, Musuku, and Ashongman.
- Focus on real-time information.
- Analyze images for architectural styles (terracotta, geometric, modern) and relate them to NewOak's high standards.
`;

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  sources: GroundingSource[];
}

/**
 * Strips all markdown symbols, asterisks, and hashtags to ensure a clean, professional appearance
 */
const sanitizeText = (text: string): string => {
  if (!text) return "";
  
  return text
    // Remove bold/italic markdown
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove headers
    .replace(/#{1,6}\s?/g, '')
    // Remove link markdown but keep text: [text](url) -> text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    // Remove inline code
    .replace(/`/g, '')
    // Remove horizontal rules
    .replace(/---/g, '')
    // Remove blockquotes markers
    .replace(/^\s*>\s+/gm, '')
    // Remove any trailing or multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateChatResponse(
    userMessage: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    coords?: { lat: number; lng: number },
    imagePart?: { inlineData: { mimeType: string; data: string } }
  ): Promise<ChatResponse> {
    try {
      const ai = this.getAI();
      const contents = [
        ...history.map(h => ({
          role: h.role,
          parts: h.parts
        })),
      ];

      const currentParts: any[] = [{ text: userMessage }];
      if (imagePart) {
        currentParts.unshift(imagePart);
      }

      contents.push({ role: 'user', parts: currentParts });

      // Using gemini-2.5-flash-latest for better compatibility with tools
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }],
          toolConfig: coords ? {
            retrievalConfig: {
              latLng: {
                latitude: coords.lat,
                longitude: coords.lng
              }
            }
          } : undefined
        },
      });

      const rawText = response.text || "I am currently analyzing the regional data. How else may I assist you?";
      const sources: GroundingSource[] = [];
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.maps) {
            sources.push({
              title: chunk.maps.title || "View Location",
              uri: chunk.maps.uri
            });
          }
        });
      }

      return { 
        text: sanitizeText(rawText), 
        sources 
      };
    } catch (error) {
      console.error("Gemini grounding error:", error);
      return { 
        text: "My apologies. Our localized intelligence grid is currently being updated. Please try again in a moment.",
        sources: []
      };
    }
  }

  async getNeighborhoodInsights(locationName: string, lat?: number, lng?: number): Promise<ChatResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a professional summary of amenities near ${locationName}, Accra. Focus on infrastructure, security, and schools. Use Google Maps grounding. Ensure no markdown formatting or asterisks.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }],
          toolConfig: lat && lng ? {
            retrievalConfig: {
              latLng: { latitude: lat, longitude: lng }
            }
          } : undefined
        }
      });

      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.maps) sources.push({ title: c.maps.title, uri: c.maps.uri });
        });
      }

      return { 
        text: sanitizeText(response.text || "This neighborhood is characterized by premium infrastructure and high-quality residential standards."), 
        sources 
      };
    } catch (error) {
      return { text: "Strategic neighborhood intelligence is currently available upon request at our sales desk.", sources: [] };
    }
  }
}

export const geminiService = new GeminiService();
