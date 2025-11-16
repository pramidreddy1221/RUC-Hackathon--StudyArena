import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { extractTextFromPDF } from '@/services/pdfExtractor'
import { sendTextToN8N } from '@/services/n8nService'
import { GameContentItem, SQLFixItem, SQLLogicItem, SQLLevelThreeItem } from '@/types/game'

interface PDFUploadProps {
  onContentReceived: (content: GameContentItem[]) => void
}

export function PDFUpload({ onContentReceived }: PDFUploadProps) {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid PDF file')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsExtracting(true)
    setError(null)

    try {
      // Extract text from PDF
      const { text, pageCount } = await extractTextFromPDF(file)
      console.log(`Extracted text from ${pageCount} pages`)

      setIsExtracting(false)
      setIsProcessing(true)

      // Send to n8n
      const result = await sendTextToN8N(text)

      setIsProcessing(false)

      if (result.success && result.content && result.content.length > 0) {
        console.log('Successfully received content from n8n:', result.content)
        
        // Check if content is SQL game (Level 1 or Level 2)
        const firstItem = result.content[0]
        
        // Check if it's a GameContentItem with sql-level-1 or sql-level-2 type
        const isSQLLevel1 = 
          firstItem &&
          typeof firstItem === 'object' &&
          'type' in firstItem &&
          (firstItem.type === 'sql-level-1' || 
           (firstItem as any).data?.type === 'sql-level-1')
        
        const isSQLLevel2 = 
          firstItem &&
          typeof firstItem === 'object' &&
          'type' in firstItem &&
          (firstItem.type === 'sql-level-2' || 
           (firstItem as any).data?.type === 'sql-level-2')
        
        const isSQLLevel3 = 
          firstItem &&
          typeof firstItem === 'object' &&
          'type' in firstItem &&
          (firstItem.type === 'sql-level-3' || 
           (firstItem as any).data?.type === 'sql-level-3')
        
        // Check if it's a direct SQL item structure (without explicit type)
        const isDirectSQLItem =
          firstItem &&
          typeof firstItem === 'object' &&
          'id' in firstItem &&
          'task' in firstItem &&
          'answer' in firstItem &&
          !isSQLLevel3
        
        // Handle SQL Level 1
        if (isSQLLevel1 || (isDirectSQLItem && !isSQLLevel2)) {
          // Extract SQL items - handle both GameContentItem format and direct format
          const sqlItems: SQLFixItem[] = result.content.map((item: any) => {
            // If it's a GameContentItem with data property
            if (item.data && typeof item.data === 'object') {
              return {
                id: item.data.id || item.id || 0,
                task: item.data.task || '',
                answer: item.data.answer || '',
                type: 'sql-level-1' as const,
              }
            }
            // If it's a direct SQLFixItem
            return {
              id: item.id || 0,
              task: item.task || '',
              answer: item.answer || '',
              type: 'sql-level-1' as const,
            }
          }).filter((item: SQLFixItem) => item.id && item.task && item.answer)
          
          if (sqlItems.length > 0) {
            console.log('Detected SQL Level 1 content, routing to level-1 page')
            navigate('/level-1', { state: { gameData: sqlItems } })
            return
          }
        }
        
        // Handle SQL Level 2
        if (isSQLLevel2) {
          // Extract SQL items - handle both GameContentItem format and direct format
          const sqlItems: SQLLogicItem[] = result.content.map((item: any) => {
            // If it's a GameContentItem with data property
            if (item.data && typeof item.data === 'object') {
              return {
                id: item.data.id || item.id || 0,
                task: item.data.task || '',
                answer: item.data.answer || '',
                type: 'sql-level-2' as const,
              }
            }
            // If it's a direct SQLLogicItem
            return {
              id: item.id || 0,
              task: item.task || '',
              answer: item.answer || '',
              type: 'sql-level-2' as const,
            }
          }).filter((item: SQLLogicItem) => item.id && item.task && item.answer)
          
          if (sqlItems.length > 0) {
            console.log('Detected SQL Level 2 content, routing to level-2 page')
            navigate('/level-2', { state: { gameData: sqlItems } })
            return
          }
        }
        
        // Handle SQL Level 3
        if (isSQLLevel3) {
          // Extract SQL items - handle both GameContentItem format and direct format
          const sqlItems: SQLLevelThreeItem[] = result.content.map((item: any) => {
            // If it's a GameContentItem with data property
            if (item.data && typeof item.data === 'object') {
              return {
                id: item.data.id || item.id || 0,
                task: item.data.task || '',
                answer: item.data.answer || '',
                type: 'sql-level-3' as const,
              }
            }
            // If it's a direct SQLLevelThreeItem
            return {
              id: item.id || 0,
              task: item.task || '',
              answer: item.answer || '',
              type: 'sql-level-3' as const,
            }
          }).filter((item: SQLLevelThreeItem) => item.id && item.task && item.answer)
          
          if (sqlItems.length > 0) {
            console.log('Detected SQL Level 3 content, routing to level-3 page')
            navigate('/level-3', { state: { gameData: sqlItems } })
            return
          }
        }
        
        // Use existing flow for other content types
        onContentReceived(result.content)
      } else {
        const errorMsg = result.error || 'Failed to generate game content. Please check the browser console for details.'
        console.error('Failed to get content from n8n:', result)
        setError(errorMsg)
      }
    } catch (err: any) {
      setIsExtracting(false)
      setIsProcessing(false)
      setError(err.message || 'An error occurred while processing the PDF')
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      setError(null)
    } else {
      setError('Please drop a valid PDF file')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload PDF Document</CardTitle>
        <CardDescription>
          Upload a PDF file to extract text and generate interactive learning content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Drop your PDF here or click to browse</p>
            <p className="text-sm text-gray-500">Supports PDF files only</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={isExtracting || isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {(isExtracting || isProcessing) && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Loading />
            <span className="text-sm text-muted-foreground">
              {isExtracting ? 'Extracting text from PDF...' : 'Generating game content...'}
            </span>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isExtracting || isProcessing}
          className="w-full"
        >
          {isExtracting || isProcessing ? (
            <>
              <Loading size={16} className="mr-2" />
              Processing...
            </>
          ) : (
            'Process PDF'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

