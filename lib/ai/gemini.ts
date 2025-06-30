import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';
import { systemConfig } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

let geminiClient: GoogleGenerativeAI | null = null;

export async function getGeminiClient(): Promise<GoogleGenerativeAI | null> {
  if (!geminiClient) {
    try {
      // Get API key from database configuration
      const apiKeyConfig = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.key, 'gemini_api_key'))
        .limit(1);

      const apiKey = apiKeyConfig[0]?.value || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.warn('Gemini API key not found in database or environment variables');
        return null;
      }

      geminiClient = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error('Error initializing Gemini client:', error);
      return null;
    }
  }
  
  return geminiClient;
}

export async function generateGeminiResponse(
  messages: { role: string; content: string }[],
  model: string = 'gemini-1.5-pro'
): Promise<string> {
  const client = await getGeminiClient();
  
  if (!client) {
    throw new Error('Gemini client not available');
  }

  try {
    const geminiModel = client.getGenerativeModel({ model });
    
    // Convert messages to Gemini format
    const prompt = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || 'No response generated';
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error('Failed to generate response with Gemini');
  }
}

export async function generateGeminiResponseWithImages(
  text: string,
  images: string[], // base64 encoded images
  model: string = 'gemini-1.5-pro-vision'
): Promise<string> {
  const client = await getGeminiClient();
  
  if (!client) {
    throw new Error('Gemini client not available');
  }

  try {
    const geminiModel = client.getGenerativeModel({ model });
    
    // Convert base64 images to Gemini format
    const imageParts = images.map(base64 => ({
      inlineData: {
        data: base64.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType: 'image/jpeg' // Assuming JPEG, could be improved to detect actual type
      }
    }));

    const parts = [
      { text },
      ...imageParts
    ];

    const result = await geminiModel.generateContent(parts);
    const response = await result.response;
    
    return response.text() || 'No response generated';
  } catch (error) {
    console.error('Error generating Gemini response with images:', error);
    throw new Error('Failed to generate response with Gemini Vision');
  }
}

export const availableGeminiModels = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
  'gemini-1.5-pro-vision'
] as const;

export type GeminiModel = typeof availableGeminiModels[number];