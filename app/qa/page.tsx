'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, CheckCircle, XCircle, HelpCircle, Trophy, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Question {
  id: string
  type: 'multiple_choice' | 'yes_no'
  question: string
  options?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

interface AnswerResult {
  isCorrect: boolean
  explanation: string
  correctAnswer: string
  score: number
  totalQuestions: number
  isCompleted: boolean
  percentage?: number
}

export default function QAPage() {
  const { data: session, status } = useSession()
  const [currentView, setCurrentView] = useState<'setup' | 'question' | 'result'>('setup')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const generateQuestions = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/qa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, questionCount })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setQuestions(data.questions)
      setCurrentQuestionIndex(0)
      setScore(0)
      setCurrentView('question')
      toast.success(`Generated ${data.questions.length} questions!`)
    } catch (error) {
      console.error('Error generating questions:', error)
      toast.error('Failed to generate questions')
    } finally {
      setIsGenerating(false)
    }
  }

  const submitAnswer = async (answer: string) => {
    if (!sessionId || !currentQuestion) return

    setIsAnswering(true)
    try {
      const response = await fetch('/api/qa/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const result = await response.json()
      setAnswerResult(result)
      setScore(result.score)
      setShowExplanation(true)

      if (result.isCompleted) {
        setTimeout(() => {
          setCurrentView('result')
        }, 3000)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
    } finally {
      setIsAnswering(false)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setAnswerResult(null)
      setShowExplanation(false)
    }
  }

  const startNewSession = () => {
    setCurrentView('setup')
    setTopic('')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setSessionId(null)
    setAnswerResult(null)
    setShowExplanation(false)
    setSelectedAnswer(null)
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to access Q&A mode.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          Q&A Mode
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your knowledge with AI-generated questions
        </p>
      </div>

      {currentView === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Your Q&A Session</CardTitle>
            <CardDescription>
              Choose a topic and difficulty level to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., JavaScript, History, Science..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Difficulty</Label>
              <div className="flex gap-2 mt-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                min="3"
                max="10"
                className="mt-1"
              />
            </div>

            <Button
              onClick={generateQuestions}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating Questions...' : 'Start Q&A Session'}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentView === 'question' && currentQuestion && (
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>Score: {score}/{questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? 'default' : 'outline'}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showExplanation || isAnswering}
                      className="justify-start text-left h-auto p-4 whitespace-normal"
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'yes_no' && (
                <div className="flex gap-4">
                  <Button
                    variant={selectedAnswer === 'Yes' ? 'default' : 'outline'}
                    onClick={() => setSelectedAnswer('Yes')}
                    disabled={showExplanation || isAnswering}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={selectedAnswer === 'No' ? 'default' : 'outline'}
                    onClick={() => setSelectedAnswer('No')}
                    disabled={showExplanation || isAnswering}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => selectedAnswer && submitAnswer(selectedAnswer)}
                  disabled={!selectedAnswer || showExplanation || isAnswering}
                  className="flex-1"
                >
                  {isAnswering ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answer Result */}
          {answerResult && showExplanation && (
            <Card className={answerResult.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {answerResult.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {answerResult.isCorrect ? 'Correct!' : 'Incorrect'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!answerResult.isCorrect && (
                    <p className="text-sm">
                      <strong>Correct answer:</strong> {answerResult.correctAnswer}
                    </p>
                  )}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Explanation:</strong> {answerResult.explanation}
                    </p>
                  </div>
                  {!answerResult.isCompleted ? (
                    <Button onClick={nextQuestion} className="w-full">
                      Next Question
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-lg font-semibold">Session Complete!</p>
                      <p className="text-muted-foreground">Redirecting to results...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentView === 'result' && answerResult && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Trophy className="h-8 w-8 text-yellow-600" />
              Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{answerResult.percentage}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg">
                <strong>Topic:</strong> {topic}
              </p>
              <Badge variant="outline" className="capitalize">
                {difficulty} difficulty
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={startNewSession} className="flex-1">
                Start New Session
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/leaderboard'}>
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}