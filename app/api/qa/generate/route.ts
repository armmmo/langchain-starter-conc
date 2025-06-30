import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OpenAI } from 'openai';
import { db } from '@/lib/db';
import { qaSessionsTable, usage, systemConfig } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

interface Question {
  id: string;
  type: 'multiple_choice' | 'yes_no' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, difficulty = 'medium', questionCount = 5 } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Get OpenAI API key from config
    const apiKeyConfig = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, 'openai_api_key'))
      .limit(1);

    const apiKey = apiKeyConfig[0]?.value || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Generate questions using OpenAI
    const prompt = `Generate ${questionCount} ${difficulty} level questions about "${topic}". 
    Create a mix of multiple choice (with 4 options) and yes/no questions.
    
    Format your response as a JSON array with this structure:
    [
      {
        "type": "multiple_choice" | "yes_no",
        "question": "Question text",
        "options": ["A", "B", "C", "D"] // only for multiple_choice
        "correctAnswer": "Correct answer",
        "explanation": "Detailed explanation of why this is correct",
        "difficulty": "${difficulty}"
      }
    ]
    
    Make sure questions are educational and engaging.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator. Generate high-quality quiz questions with clear explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    let questions: Question[];
    try {
      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI');
      }
      questions = JSON.parse(response);
      
      // Add IDs to questions
      questions = questions.map(q => ({ ...q, id: nanoid() }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    // Create Q&A session
    const sessionId = nanoid();
    await db.insert(qaSessionsTable).values({
      id: sessionId,
      userId: session.user.id,
      topic,
      difficulty,
      totalQuestions: questions.length,
      questions: JSON.stringify(questions),
      userAnswers: JSON.stringify([]),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Track usage
    await db.insert(usage).values({
      id: nanoid(),
      userId: session.user.id,
      type: 'qa_generation',
      count: questions.length,
      date: new Date(),
      metadata: JSON.stringify({ topic, difficulty, sessionId })
    });

    return NextResponse.json({
      sessionId,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty
        // Don't include correct answer or explanation
      }))
    });

  } catch (error) {
    console.error('Q&A generation error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}