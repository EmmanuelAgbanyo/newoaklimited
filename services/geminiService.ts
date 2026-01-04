/// <reference types="vite/client" />
import { GoogleGenAI } from '@google/genai';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  sources: GroundingSource[];
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
// Using REST API primarily to avoid SDK version conflicts
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class GeminiService {

  async generateChatResponse(
    userMessage: string,
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    coords?: { lat: number; lng: number },
    imagePart?: { inlineData: { mimeType: string; data: string } },
    siteContext?: { properties: any[], team: any[] }
  ): Promise<ChatResponse> {
    if (!apiKey) {
      return {
        text: "Configuration Error: API Key is missing.",
        sources: []
      };
    }

    try {
      // Clean context for prompt
      const contextSummary = siteContext ? `
      CURRENT INVENTORY:
      ${siteContext.properties.map(p => `- ${p.title} (${p.category}): ${p.beds || '?'} Beds, $${p.price?.toLocaleString() || 'POA'}, Location: ${p.location}`).join('\n')}
      
      KEY TEAM MEMBERS:
      ${siteContext.team.map(t => `- ${t.name}, ${t.role}`).join('\n')}
      ` : '';

      const systemInstruction = `You are the NewOak Executive Concierge.
      
      CORE DIRECTIVES:
      1. STYLE: Speak in elegant, professional prose. DO NOT use markdown symbols like **bold**, *italics*, or lists. Use clean paragraphs only.
      2. CONTACT: If asked for contact info, quote these exact details: "Phones: 0244517076, 0246273940, or UK: +44 784 554 3919" and "Email: sales@newoakcompanylimited.com".
      3. KNOWLEDGE: Use the provided CURRENT INVENTORY to answer questions about properties. If a user asks about specific locations or features, implicitly reference these assets.
      
      CONTEXT DATA:
      ${contextSummary}
      
      User location: ${coords ? `Lat: ${coords.lat}, Lng: ${coords.lng}` : 'Unknown'}.
      Keep responses concise (under 3 sentences) unless asked for details.`;

      const contents = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: h.parts
      }));

      const currentParts: any[] = [{ text: userMessage }];
      if (imagePart) {
        currentParts.push(imagePart);
      }
      contents.push({ role: 'user', parts: currentParts });

      const response = await fetch(`${API_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request.";

      return {
        text: responseText,
        sources: []
      };

    } catch (error: any) {
      console.error("Gemini REST API error:", error);
      const isKeyError = error.message?.includes('400') || error.message?.includes('key') || !apiKey;
      return {
        text: `Connection failed: ${error.message || 'Unknown error'}.${isKeyError ? ' (Did you restart the terminal after verifying the .env file?)' : ''}`,
        sources: []
      };
    }
  }

  async getNeighborhoodInsights(locationName: string, lat?: number, lng?: number): Promise<ChatResponse> {
    if (!apiKey) return { text: "API Key missing.", sources: [] };

    try {
      const prompt = `Provide a professional summary of amenities near ${locationName}, Accra. Focus on infrastructure, security, and schools. Keep it under 100 words.`;

      const response = await fetch(`${API_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
      }
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No data available.";

      return {
        text: responseText,
        sources: []
      };
    } catch (error: any) {
      console.error("Neighborhood insights error:", error);
      return {
        text: `Insights unavailable: ${error.message || 'Connection error'}.`,
        sources: []
      };
    }
  }
}

export const geminiService = new GeminiService();
