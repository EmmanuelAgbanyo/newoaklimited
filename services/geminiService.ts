
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  sources: GroundingSource[];
}

const getApiUrl = (): string => {
  // Use relative path for API calls, works in both local dev and production
  return '/.netlify/functions/chat';
};

export class GeminiService {
  async generateChatResponse(
    userMessage: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    coords?: { lat: number; lng: number },
    imagePart?: { inlineData: { mimeType: string; data: string } }
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          history,
          coords,
          imagePart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Chat API error:", error);
      return { 
        text: "My apologies. Our localized intelligence grid is currently being updated. Please try again in a moment.",
        sources: []
      };
    }
  }

  async getNeighborhoodInsights(locationName: string, lat?: number, lng?: number): Promise<ChatResponse> {
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: `Provide a professional summary of amenities near ${locationName}, Accra. Focus on infrastructure, security, and schools. Use Google Maps grounding. Ensure no markdown formatting or asterisks.`,
          history: [],
          coords: lat && lng ? { lat, lng } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Neighborhood insights error:", error);
      return { 
        text: "Strategic neighborhood intelligence is currently available upon request at our sales desk.", 
        sources: [] 
      };
    }
  }
}

export const geminiService = new GeminiService();
