import axios from 'axios'
import { SQLLogicItem, SQLLevelThreeItem } from '@/types/game'

const NEXT_LEVEL_WEBHOOK_URL = import.meta.env.VITE_N8N_NEXT_LEVEL_WEBHOOK_URL || 'https://ruchack.app.n8n.cloud/webhook/c3a31930-f466-4674-8cc7-460fccc05d7d'

export interface NextLevelResponse {
  success: boolean
  gameData?: SQLLogicItem[] | SQLLevelThreeItem[]
  error?: string
}

/**
 * Extracts JSON from a markdown code block
 */
function extractJsonFromMarkdown(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '')
  cleaned = cleaned.replace(/\n?```\s*$/, '')
  return cleaned.trim()
}

/**
 * Parses the webhook response and extracts game data based on level
 */
function parseNextLevelResponse(data: any, level: number): SQLLogicItem[] | SQLLevelThreeItem[] {
  console.log('Parsing next level response:', data)
  
  // Handle nested structure: data[0].content.parts[0].text
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0]
    
    // Check for nested structure: content.parts[0].text
    if (firstItem?.content?.parts && Array.isArray(firstItem.content.parts) && firstItem.content.parts.length > 0) {
      const textContent = firstItem.content.parts[0]?.text
      
      if (textContent && typeof textContent === 'string') {
        console.log('Found text content in nested structure')
        
        // Extract and parse JSON from the text
        const jsonString = extractJsonFromMarkdown(textContent)
        
        try {
          const parsed = JSON.parse(jsonString)
          console.log('Parsed JSON:', parsed)
          
          // Extract tasks array
          if (parsed.tasks && Array.isArray(parsed.tasks)) {
            if (level === 2) {
              const sqlItems: SQLLogicItem[] = parsed.tasks.map((item: any) => ({
                id: item.id || 0,
                task: item.task || '',
                answer: item.answer || '',
                type: 'sql-level-2' as const,
              })).filter((item: SQLLogicItem) => item.id && item.task && item.answer)
              return sqlItems
            } else {
              const sqlItems: SQLLevelThreeItem[] = parsed.tasks.map((item: any) => ({
                id: item.id || 0,
                task: item.task || '',
                answer: item.answer || '',
                type: 'sql-level-3' as const,
              })).filter((item: SQLLevelThreeItem) => item.id && item.task && item.answer)
              return sqlItems
            }
          }
          
          // If tasks is directly an array
          if (Array.isArray(parsed)) {
            if (level === 2) {
              return parsed.map((item: any) => ({
                id: item.id || 0,
                task: item.task || '',
                answer: item.answer || '',
                type: 'sql-level-2' as const,
              })).filter((item: SQLLogicItem) => item.id && item.task && item.answer)
            } else {
              return parsed.map((item: any) => ({
                id: item.id || 0,
                task: item.task || '',
                answer: item.answer || '',
                type: 'sql-level-3' as const,
              })).filter((item: SQLLevelThreeItem) => item.id && item.task && item.answer)
            }
          }
        } catch (error) {
          console.error('Error parsing JSON from webhook response:', error)
        }
      }
    }
    
    // Check if first item has text property directly
    if (firstItem?.text && typeof firstItem.text === 'string') {
      const jsonString = extractJsonFromMarkdown(firstItem.text)
      try {
        const parsed = JSON.parse(jsonString)
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          if (level === 2) {
            return parsed.tasks.map((item: any) => ({
              id: item.id || 0,
              task: item.task || '',
              answer: item.answer || '',
              type: 'sql-level-2' as const,
            })).filter((item: SQLLogicItem) => item.id && item.task && item.answer)
          } else {
            return parsed.tasks.map((item: any) => ({
              id: item.id || 0,
              task: item.task || '',
              answer: item.answer || '',
              type: 'sql-level-3' as const,
            })).filter((item: SQLLevelThreeItem) => item.id && item.task && item.answer)
          }
        }
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    }
  }
  
  return []
}

export async function callNextLevelWebhook(level: number): Promise<NextLevelResponse> {
  try {
    const data = {"current level" : level}
    console.log('Calling next level webhook:', NEXT_LEVEL_WEBHOOK_URL)
    
    const response = await axios.post(
      NEXT_LEVEL_WEBHOOK_URL,
      {
        data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }
    )

    console.log('Next level webhook response:', response.data)
    
    // Parse the response to extract game data
    // The level parameter indicates which level we're requesting (1 = get level 2, 2 = get level 3)
    const nextLevel = level + 1
    const gameData = parseNextLevelResponse(response.data, nextLevel)
    
    if (gameData.length > 0) {
      console.log('Extracted game data:', gameData)
      return {
        success: true,
        gameData,
      }
    }
    
    return {
      success: true,
    }
  } catch (error: any) {
    console.error('Error calling next level webhook:', error)
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to call next level webhook',
    }
  }
}

