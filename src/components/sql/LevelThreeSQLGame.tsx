import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Hearts } from './Hearts'
import { useSQLLevelThree } from '@/hooks/useSQLLevelThree'
import { SQLLevelThreeItem } from '@/types/game'
import { CheckCircle2, XCircle, Code, Database, Sparkles } from 'lucide-react'

interface LevelThreeSQLGameProps {
  questions: SQLLevelThreeItem[]
  onComplete: () => void
}

export function LevelThreeSQLGame({ questions, onComplete }: LevelThreeSQLGameProps) {
  const {
    currentIndex,
    currentQuestion,
    hearts,
    userAnswer,
    setUserAnswer,
    isLocked,
    isCorrect,
    showAnswer,
    feedbackMessage,
    submitAnswer,
    totalQuestions,
  } = useSQLLevelThree({ questions, onComplete })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when question changes
  useEffect(() => {
    if (textareaRef.current && !isLocked) {
      textareaRef.current.focus()
    }
  }, [currentIndex, isLocked])

  // Handle Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submitAnswer()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                Level 3: Complex SQL Builder
              </CardTitle>
              <CardDescription>
                Question {currentIndex + 1} of {totalQuestions} • Advanced Multi-Table Queries
              </CardDescription>
            </div>
            <Hearts count={hearts} maxCount={2} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Display */}
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-start gap-3">
              <Database className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-900 mb-2">Complex Task:</p>
                <p className="text-lg text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                  {currentQuestion.task}
                </p>
                <p className="text-xs text-indigo-700 mt-3 italic">
                  💡 This requires JOINs, aggregations, subqueries, or complex business logic.
                </p>
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label htmlFor="sql-answer" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Write your complex SQL query:
            </label>
            <Textarea
              id="sql-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLocked}
              placeholder="SELECT ... FROM ... JOIN ... WHERE ... GROUP BY ... HAVING ..."
              className="font-mono text-base min-h-[220px] resize-none"
            />
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter (or Cmd+Enter on Mac) to submit
            </p>
          </div>

          {/* Feedback Messages */}
          {isCorrect === true && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Correct! 🎉</p>
                <p className="text-sm text-green-700">{feedbackMessage}</p>
                <p className="text-xs text-green-600 mt-1">Moving to next question...</p>
              </div>
            </div>
          )}

          {isCorrect === false && hearts > 0 && (
            <div className={`bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-300 ${!isCorrect && hearts < 2 ? 'animate-shake' : ''}`}>
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Incorrect</p>
                <p className="text-sm text-red-700">{feedbackMessage}</p>
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 animate-in fade-in duration-300">
              <p className="font-medium text-yellow-900 mb-2">Correct Answer:</p>
              <div className="bg-yellow-100 p-4 rounded border border-yellow-300">
                <p className="font-mono text-sm text-yellow-900 break-words whitespace-pre-wrap leading-relaxed">
                  {currentQuestion.answer}
                </p>
              </div>
              <p className="text-sm text-yellow-700 mt-2">{feedbackMessage}</p>
              <p className="text-xs text-yellow-600 mt-1">Moving to next question...</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={submitAnswer}
            disabled={isLocked || !userAnswer.trim()}
            className="w-full"
            size="lg"
          >
            {isLocked ? (
              'Processing...'
            ) : (
              'Submit Answer'
            )}
          </Button>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

