import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LevelTwoSQLGame } from '@/components/sql/LevelTwoSQLGame'
import { SQLLogicItem } from '@/types/game'
import { callNextLevelWebhook } from '@/services/sqlGameService'
import { Loading } from '@/components/ui/loading'

interface LocationState {
  gameData: SQLLogicItem[]
}

export function LevelTwoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [questions, setQuestions] = useState<SQLLogicItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLevel2Data = useCallback(async () => {
    try {
      console.log('Fetching level 2 data from webhook...')
      const result = await callNextLevelWebhook(1)
      
      if (result.success && result.gameData && result.gameData.length > 0) {
        console.log('Successfully fetched level 2 data:', result.gameData)
        // Type guard to ensure we only set SQLLogicItem[]
        const level2Data = result.gameData.filter(
          (item): item is SQLLogicItem => 
            item && typeof item === 'object' && 'type' in item && item.type === 'sql-level-2'
        )
        if (level2Data.length > 0) {
          setQuestions(level2Data)
        }
        setIsLoading(false)
      } else {
        console.error('Failed to fetch level 2 data from webhook')
        setIsLoading(false)
        // Don't navigate away - let the component show the "No questions" message
      }
    } catch (error) {
      console.error('Error fetching level 2 data:', error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const state = location.state as LocationState | null
    
    console.log('LevelTwoPage - location.state:', location.state)
    console.log('LevelTwoPage - state?.gameData:', state?.gameData)
    
    if (state?.gameData && Array.isArray(state.gameData)) {
      // Ensure all items have the correct structure
      const validQuestions = state.gameData.filter(
        (item): item is SQLLogicItem =>
          item &&
          typeof item === 'object' &&
          'id' in item &&
          'task' in item &&
          'answer' in item
      )
      
      console.log('LevelTwoPage - validQuestions:', validQuestions)
      
      if (validQuestions.length > 0) {
        setQuestions(validQuestions)
        setIsLoading(false)
      } else {
        console.error('Invalid game data format. Received:', state.gameData)
        // Don't navigate away immediately - try to fetch from webhook
        fetchLevel2Data()
      }
    } else {
      console.warn('No game data found in navigation state. Attempting to fetch from webhook...')
      // Try to fetch level 2 data from webhook as fallback
      fetchLevel2Data()
    }
  }, [location.state, navigate, fetchLevel2Data])

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      const result = await callNextLevelWebhook(3)
      
      if (result.success && result.gameData && result.gameData.length > 0) {
        // Navigate to level 3 with the game data from webhook
        console.log('Navigating to level 3 with game data:', result.gameData)
        navigate('/level-3', { state: { gameData: result.gameData } })
      } else {
        // If no game data, just navigate to home
        console.warn('No game data in webhook response, navigating to home')
        navigate('/')
      }
    } catch (error) {
      console.error('Error calling next level webhook:', error)
      // Still navigate even if webhook fails
      navigate('/')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Loading size={48} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No questions available</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return <LevelTwoSQLGame questions={questions} onComplete={handleComplete} />
}

