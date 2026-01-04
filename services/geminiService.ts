/// <reference types="vite/client" />

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  sources: GroundingSource[];
}

// Use serverless function to keep API key secure on the server
const CHAT_FUNCTION_URL = '/.netlify/functions/chat';

export class GeminiService {

  async generateChatResponse(
    userMessage: string,
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    coords?: { lat: number; lng: number },
    imagePart?: { inlineData: { mimeType: string; data: string } },
    siteContext?: { properties: any[], team: any[] }
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(CHAT_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          history,
          coords,
          imagePart
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || response.statusText);
      }

      const data = await response.json();
      return {
        text: data.text || "I couldn't process that request.",
        sources: data.sources || []
      };

    } catch (error: any) {
      console.error("Chat service error:", error);
      return {
        text: `Connection failed: ${error.message || 'Unknown error'}. Please try again.`,
        sources: []
      };
    }
  }

  async getNeighborhoodInsights(locationName: string, lat?: number, lng?: number): Promise<ChatResponse> {
    try {
      const prompt = `Provide a professional summary of amenities near ${locationName}, Accra. Focus on infrastructure, security, and schools. Keep it under 100 words.`;

      const response = await fetch(CHAT_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: prompt,
          history: [],
          coords: lat && lng ? { lat, lng } : undefined
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || response.statusText);
      }

      const data = await response.json();
      return {
        text: data.text || "No data available.",
        sources: data.sources || []
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
