import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { qaSessionsTable, userHistory, leaderboard } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, questionId, answer } = await request.json();

    if (!sessionId || !questionId || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the session
    const qaSession = await db
      .select()
      .from(qaSessionsTable)
      .where(and(
        eq(qaSessionsTable.id, sessionId),
        eq(qaSessionsTable.userId, (session.user as any).id)
      ))
      .limit(1);

    if (!qaSession[0]) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = qaSession[0];
    const questions = JSON.parse(sessionData.questions) as any[];
    const userAnswers = JSON.parse(sessionData.userAnswers || '[]') as any[];

    // Find the question
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if already answered
    const existingAnswer = userAnswers.find((a: any) => a.questionId === questionId);
    if (existingAnswer) {
      return NextResponse.json({ error: 'Question already answered' }, { status: 400 });
    }

    // Record the answer
    const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
    const newAnswer = {
      questionId,
      answer,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    userAnswers.push(newAnswer);

    // Update session
    const newScore = sessionData.score + (isCorrect ? 1 : 0);
    const newQuestionIndex = sessionData.currentQuestionIndex + 1;
    const isCompleted = newQuestionIndex >= sessionData.totalQuestions;

    await db
      .update(qaSessionsTable)
      .set({
        userAnswers: JSON.stringify(userAnswers),
        score: newScore,
        currentQuestionIndex: newQuestionIndex,
        isCompleted,
        updatedAt: new Date()
      })
      .where(eq(qaSessionsTable.id, sessionId));

    // If session completed, save to history and leaderboard
    if (isCompleted) {
      // Save to user history
      await db.insert(userHistory).values({
        id: nanoid(),
        userId: (session.user as any).id,
        type: 'qa',
        title: `Q&A: ${sessionData.topic}`,
        content: JSON.stringify({
          topic: sessionData.topic,
          difficulty: sessionData.difficulty,
          score: newScore,
          totalQuestions: sessionData.totalQuestions,
          percentage: Math.round((newScore / sessionData.totalQuestions) * 100)
        }),
        score: newScore,
        createdAt: new Date()
      });

      // Save to leaderboard
      const percentage = Math.round((newScore / sessionData.totalQuestions) * 100);
      await db.insert(leaderboard).values({
        id: nanoid(),
        userId: (session.user as any).id,
        type: 'qa',
        topic: sessionData.topic,
        difficulty: sessionData.difficulty,
        score: newScore,
        maxScore: sessionData.totalQuestions,
        percentage,
        sessionId,
        createdAt: new Date()
      });
    }

    return NextResponse.json({
      isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
      score: newScore,
      totalQuestions: sessionData.totalQuestions,
      isCompleted,
      percentage: isCompleted ? Math.round((newScore / sessionData.totalQuestions) * 100) : null
    });

  } catch (error) {
    console.error('Q&A answer error:', error);
    return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
  }
}