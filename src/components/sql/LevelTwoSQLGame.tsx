import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Hearts } from './Hearts'
import { useSQLLevelTwo } from '@/hooks/useSQLLevelTwo'
import { SQLLogicItem } from '@/types/game'
import { CheckCircle2, XCircle, Code, Lightbulb } from 'lucide-react'

interface LevelTwoSQLGameProps {
  questions: SQLLogicItem[]
  onComplete: () => void
}

export function LevelTwoSQLGame({ questions, onComplete }: LevelTwoSQLGameProps) {
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
  } = useSQLLevelTwo({ questions, onComplete })

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Level 2: SQL Logic Builder</CardTitle>
              <CardDescription>
                Question {currentIndex + 1} of {totalQuestions}
              </CardDescription>
            </div>
            <Hearts count={hearts} maxCount={2} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900 mb-2">Task:</p>
                <p className="text-lg text-gray-900 whitespace-pre-wrap break-words">
                  {currentQuestion.task}
                </p>
                <p className="text-xs text-purple-700 mt-2 italic">
                  Write a SQL query to solve this task from scratch.
                </p>
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label htmlFor="sql-answer" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Write your SQL query:
            </label>
            <Textarea
              id="sql-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLocked}
              placeholder="SELECT ... FROM ... WHERE ..."
              className="font-mono text-base min-h-[180px] resize-none"
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
              <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                <p className="font-mono text-base text-yellow-900 break-words whitespace-pre-wrap">
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

