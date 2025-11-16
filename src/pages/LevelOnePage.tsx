import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LevelOneSQLGame } from '@/components/sql/LevelOneSQLGame'
import { SQLFixItem } from '@/types/game'
import { callNextLevelWebhook } from '@/services/sqlGameService'
import { Loading } from '@/components/ui/loading'

interface LocationState {
  gameData: SQLFixItem[]
}

export function LevelOnePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [questions, setQuestions] = useState<SQLFixItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const state = location.state as LocationState | null
    
    if (state?.gameData && Array.isArray(state.gameData)) {
      // Ensure all items have the correct structure
      const validQuestions = state.gameData.filter(
        (item): item is SQLFixItem =>
          item &&
          typeof item === 'object' &&
          'id' in item &&
          'task' in item &&
          'answer' in item
      )
      
      if (validQuestions.length > 0) {
        setQuestions(validQuestions)
        setIsLoading(false)
      } else {
        console.error('Invalid game data format')
        navigate('/')
      }
    } else {
      console.error('No game data found in navigation state')
      navigate('/')
    }
  }, [location.state, navigate])

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      const result = await callNextLevelWebhook(2)
      
      if (result.success && result.gameData && result.gameData.length > 0) {
        // Navigate to level 2 with the game data from webhook
        console.log('Navigating to level 2 with game data:', result.gameData)
        navigate('/level-2', { state: { gameData: result.gameData } })
      } else {
        // If no game data, just navigate to level 2 (user might need to upload PDF)
        console.warn('No game data in webhook response, navigating to level 2 without data')
        navigate('/level-2')
      }
    } catch (error) {
      console.error('Error calling next level webhook:', error)
      // Still navigate even if webhook fails
      navigate('/level-2')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loading size={48} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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

  return <LevelOneSQLGame questions={questions} onComplete={handleComplete} />
}

