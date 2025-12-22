import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

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

interface RequestBody {
  userMessage: string;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  coords?: { lat: number; lng: number };
  imagePart?: { inlineData: { mimeType: string; data: string } };
}

const sanitizeText = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s?/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/`/g, '')
    .replace(/---/g, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }),
      };
    }

    const body = JSON.parse(event.body || '{}') as RequestBody;
    const { userMessage, history, coords, imagePart } = body;

    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userMessage is required' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      ...history.map((h) => ({
        role: h.role,
        parts: h.parts,
      })),
    ];

    const currentParts: any[] = [{ text: userMessage }];
    if (imagePart) {
      currentParts.unshift(imagePart);
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }],
        toolConfig: coords
          ? {
              retrievalConfig: {
                latLng: {
                  latitude: coords.lat,
                  longitude: coords.lng,
                },
              },
            }
          : undefined,
      },
    });

    const rawText =
      response.text ||
      'I am currently analyzing the regional data. How else may I assist you?';
    const sources: { title: string; uri: string }[] = [];
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks && groundingChunks.length > 0) {
      groundingChunks.forEach((chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
          const isDuplicate = sources.some((s) => s.uri === chunk.web?.uri);
          if (!isDuplicate) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri,
            });
          }
        }
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sanitizeText(rawText),
        sources,
      }),
    };
  } catch (error) {
    console.error('Chat function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

export { handler };
