import { useState, useCallback } from 'react'
import { SQLLogicItem } from '@/types/game'
import { normalizeSql } from '@/utils/normalizeSql'
import { sqlMatchesPattern } from '@/utils/sqlPatternCheck'

interface UseSQLLevelTwoProps {
  questions: SQLLogicItem[]
  onComplete: () => void
}

export function useSQLLevelTwo({ questions, onComplete }: UseSQLLevelTwoProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hearts, setHearts] = useState(2)
  const [userAnswer, setUserAnswer] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const goToNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete()
    } else {
      setCurrentIndex((prev) => prev + 1)
      setUserAnswer('')
      setIsLocked(false)
      setIsCorrect(null)
      setShowAnswer(false)
      setFeedbackMessage('')
    }
  }, [isLastQuestion, onComplete])

  const submitAnswer = useCallback(() => {
    if (isLocked || !userAnswer.trim()) return

    const normalizedUserAnswer = normalizeSql(userAnswer)
    const normalizedCorrectAnswer = normalizeSql(currentQuestion.answer)

    // Try exact match first
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setIsCorrect(true)
      setIsLocked(true)
      setFeedbackMessage('Perfect! Your SQL query is correct.')
      
      setTimeout(() => {
        goToNext()
      }, 1000)
      return
    }

    // Try pattern-based matching
    if (sqlMatchesPattern(userAnswer, currentQuestion.answer)) {
      setIsCorrect(true)
      setIsLocked(true)
      setFeedbackMessage('Great! Your SQL logic is correct.')
      
      setTimeout(() => {
        goToNext()
      }, 1000)
      return
    }

    // Wrong answer
    setIsCorrect(false)
    const newHearts = hearts - 1
    setHearts(newHearts)
    setFeedbackMessage('Incorrect. Try again!')

    if (newHearts === 0) {
      // No hearts left - show answer and auto-advance
      setIsLocked(true)
      setShowAnswer(true)
      setFeedbackMessage('Out of hearts! Here is the correct answer.')
      
      setTimeout(() => {
        goToNext()
      }, 2000)
    } else {
      // Still has hearts - allow retry
      setUserAnswer('')
      setFeedbackMessage(`Incorrect. You have ${newHearts} heart${newHearts !== 1 ? 's' : ''} remaining.`)
    }
  }, [userAnswer, currentQuestion, hearts, isLocked, goToNext])

  const resetGame = useCallback(() => {
    setCurrentIndex(0)
    setHearts(2)
    setUserAnswer('')
    setIsLocked(false)
    setIsCorrect(null)
    setShowAnswer(false)
    setFeedbackMessage('')
  }, [])

  return {
    currentIndex,
    currentQuestion,
    hearts,
    userAnswer,
    setUserAnswer,
    isLocked,
    isCorrect,
    showAnswer,
    feedbackMessage,
    isLastQuestion,
    submitAnswer,
    goToNext,
    resetGame,
    totalQuestions: questions.length,
  }
}

