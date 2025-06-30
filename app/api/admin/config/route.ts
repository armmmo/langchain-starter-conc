import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { systemConfig } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await db.select().from(systemConfig);
    
    // Hide secret values for security
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      value: config.isSecret ? (config.value ? '••••••••••••••••' : '') : config.value
    }));

    return NextResponse.json({ configs: sanitizedConfigs });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Check if config exists
    const existingConfig = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key))
      .limit(1);

    const configDefaults: Record<string, { description: string; isSecret: boolean }> = {
      'openai_api_key': { description: 'OpenAI API Key for GPT models and embeddings', isSecret: true },
      'gemini_api_key': { description: 'Google Gemini API Key for Gemini models', isSecret: true },
      'default_ai_model': { description: 'Default AI model to use for chat responses', isSecret: false },
      'max_document_size_mb': { description: 'Maximum document upload size in MB', isSecret: false }
    };

    if (existingConfig.length > 0) {
      // Update existing config
      await db
        .update(systemConfig)
        .set({ 
          value,
          updatedAt: new Date()
        })
        .where(eq(systemConfig.key, key));
    } else {
      // Create new config
      const defaultConfig = configDefaults[key];
      await db.insert(systemConfig).values({
        id: nanoid(),
        key,
        value,
        description: defaultConfig?.description || `Configuration for ${key}`,
        isSecret: defaultConfig?.isSecret || false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}