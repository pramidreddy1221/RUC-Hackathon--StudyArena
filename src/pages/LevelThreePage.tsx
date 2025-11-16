import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LevelThreeSQLGame } from '@/components/sql/LevelThreeSQLGame'
import { SQLLevelThreeItem } from '@/types/game'
import { callNextLevelWebhook } from '@/services/sqlGameService'
import { Loading } from '@/components/ui/loading'

interface LocationState {
  gameData: SQLLevelThreeItem[]
}

export function LevelThreePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [questions, setQuestions] = useState<SQLLevelThreeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLevel3Data = useCallback(async () => {
    try {
      console.log('Fetching level 3 data from webhook...')
      const result = await callNextLevelWebhook(3)
      
      if (result.success && result.gameData && result.gameData.length > 0) {
        console.log('Successfully fetched level 3 data:', result.gameData)
        // Type guard to ensure we only set SQLLevelThreeItem[]
        const level3Data = result.gameData.filter(
          (item): item is SQLLevelThreeItem => 
            item && typeof item === 'object' && 'type' in item && item.type === 'sql-level-3'
        )
        if (level3Data.length > 0) {
          setQuestions(level3Data)
        }
        setIsLoading(false)
      } else {
        console.error('Failed to fetch level 3 data from webhook')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching level 3 data:', error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const state = location.state as LocationState | null
    
    console.log('LevelThreePage - location.state:', location.state)
    console.log('LevelThreePage - state?.gameData:', state?.gameData)
    
    if (state?.gameData && Array.isArray(state.gameData)) {
      // Ensure all items have the correct structure
      const validQuestions = state.gameData.filter(
        (item): item is SQLLevelThreeItem =>
          item &&
          typeof item === 'object' &&
          'id' in item &&
          'task' in item &&
          'answer' in item
      )
      
      console.log('LevelThreePage - validQuestions:', validQuestions)
      
      if (validQuestions.length > 0) {
        setQuestions(validQuestions)
        setIsLoading(false)
      } else {
        console.error('Invalid game data format. Received:', state.gameData)
        fetchLevel3Data()
      }
    } else {
      console.warn('No game data found in navigation state. Attempting to fetch from webhook...')
      fetchLevel3Data()
    }
  }, [location.state, navigate, fetchLevel3Data])

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      await callNextLevelWebhook(3)
      // Navigate to home after completing level 3
      navigate("/complete", {
        state: {
          score: 100
        }
      });
    } catch (error) {
      console.error('Error calling next level webhook:', error)
      navigate('/')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <Loading size={48} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
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

  return <LevelThreeSQLGame questions={questions} onComplete={handleComplete} />
}

