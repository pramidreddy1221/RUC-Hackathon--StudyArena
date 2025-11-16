import { useState } from 'react'
import { PDFUpload } from '@/components/PDFUpload'
import { GameContent } from '@/components/GameContent'
import { GameContentItem } from '@/types/game'
import { BookOpen } from 'lucide-react'

export function Home() {
  const [gameContent, setGameContent] = useState<GameContentItem[] | null>(null)

  const handleContentReceived = (content: GameContentItem[]) => {
    setGameContent(content)
  }

  const handleReset = () => {
    setGameContent(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            StudyArena
          </h1>
          <p className="text-lg text-gray-600">
            Transform your PDFs into interactive learning experiences
          </p>
        </div>

        {!gameContent ? (
          <PDFUpload onContentReceived={handleContentReceived} />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Upload New PDF
              </button>
            </div>
            <GameContent content={gameContent} />
          </div>
        )}
      </div>
    </div>
  )
}

