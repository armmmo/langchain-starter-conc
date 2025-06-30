import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { usageMetrics, chatMessages, chatSessions } from '@/lib/db/schema';
import { generateRAGResponse } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, sessionId, teamId, includeRAG = false } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const teamIdToUse = teamId || session.user.teams?.[0]?.teamId;
    if (!teamIdToUse) {
      return NextResponse.json({ error: 'No team found' }, { status: 400 });
    }

    // Initialize the multimodal model
    const model = new ChatOpenAI({
      modelName: 'gpt-4-vision-preview',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Convert messages to LangChain format, handling both text and images
    const langchainMessages = messages.map((msg: any) => {
      if (msg.role === 'user') {
        // Handle multimodal content (text + images)
        if (Array.isArray(msg.content)) {
          return new HumanMessage({
            content: msg.content.map((item: any) => {
              if (item.type === 'text') {
                return {
                  type: 'text',
                  text: item.text,
                };
              } else if (item.type === 'image_url') {
                return {
                  type: 'image_url',
                  image_url: {
                    url: item.image_url.url,
                    detail: item.image_url.detail || 'auto',
                  },
                };
              }
              return item;
            }),
          });
        } else {
          // Handle simple text content
          return new HumanMessage(msg.content);
        }
      }
      // For assistant messages, just return the content as is
      return msg;
    });

    let finalResponse = '';
    let sources: any[] = [];

    // If RAG is enabled, try to get context from documents
    if (includeRAG) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        let queryText = '';
        
        // Extract text from multimodal content
        if (Array.isArray(lastUserMessage.content)) {
          const textContent = lastUserMessage.content.find((item: any) => item.type === 'text');
          queryText = textContent?.text || '';
        } else {
          queryText = lastUserMessage.content;
        }

        if (queryText) {
          const ragResponse = await generateRAGResponse(queryText, teamIdToUse, session.user.id);
          sources = ragResponse.sources;
          
          // Add RAG context to the conversation
          if (ragResponse.sources.length > 0) {
            const contextMessage = `Context from your documents:\n${ragResponse.sources.map((s, i) => `[${i + 1}] ${s.content}`).join('\n\n')}`;
            
            langchainMessages.unshift(new HumanMessage(`System: Use this context to help answer questions:\n${contextMessage}`));
          }
        }
      }
    }

    // Generate response
    const response = await model.invoke(langchainMessages);
    finalResponse = response.content as string;

    // Save the conversation if sessionId is provided
    if (sessionId) {
      // Save user message
      await db.insert(chatMessages).values({
        sessionId,
        role: 'user',
        content: JSON.stringify(messages[messages.length - 1]),
        metadata: { multimodal: true, includeRAG },
      });

      // Save assistant response
      await db.insert(chatMessages).values({
        sessionId,
        role: 'assistant',
        content: finalResponse,
        metadata: { sources: sources.length > 0 ? sources : undefined },
      });
    }

    // Track usage
    await db.insert(usageMetrics).values({
      teamId: teamIdToUse,
      userId: session.user.id,
      type: 'query',
      metadata: { 
        multimodal: true, 
        includeRAG,
        sourcesCount: sources.length 
      },
    });

    return NextResponse.json({
      response: finalResponse,
      sources,
      usage: {
        tokensUsed: Math.ceil(finalResponse.length / 4), // Rough estimation
        multimodal: true,
      },
    });

  } catch (error) {
    console.error('Multimodal chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process multimodal request' },
      { status: 500 }
    );
  }
}

// Helper function to validate image URLs
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

// Helper function to convert base64 image to data URL if needed
function processImageContent(content: any): any {
  if (content.type === 'image_url') {
    const url = content.image_url.url;
    
    // If it's already a data URL or HTTP URL, return as is
    if (url.startsWith('data:') || url.startsWith('http')) {
      return content;
    }
    
    // If it's base64 without data URL prefix, add it
    if (url.match(/^[A-Za-z0-9+/]+=*$/)) {
      return {
        ...content,
        image_url: {
          ...content.image_url,
          url: `data:image/jpeg;base64,${url}`,
        },
      };
    }
  }
  
  return content;
}