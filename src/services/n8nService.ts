import axios from 'axios'
import { GameContentItem } from '@/types/game'

export interface N8NResponse {
  success: boolean
  content?: GameContentItem[]
  error?: string
}

// Update this URL with your n8n webhook URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://ruchack.app.n8n.cloud/webhook/c3a31930-f466-4674-8cc7-460fccc05d7d'

/**
 * Extracts JSON from a markdown code block
 */
function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code block markers (```json and ```)
  let cleaned = text.trim()
  
  // Remove opening ```json or ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '')
  
  // Remove closing ```
  cleaned = cleaned.replace(/\n?```\s*$/, '')
  
  return cleaned.trim()
}

/**
 * Parses JSON string and extracts game content
 */
function parseGameContent(jsonString: string): GameContentItem[] {
  try {
    const parsed = JSON.parse(jsonString)
    console.log('Parsed JSON:', parsed)
    
    // If parsed data has a tasks array
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      return parsed.tasks as GameContentItem[]
    }
    
    // If parsed data is an array, return it
    if (Array.isArray(parsed)) {
      return parsed as GameContentItem[]
    }
    
    // If parsed data has a content property
    if (parsed.content && Array.isArray(parsed.content)) {
      return parsed.content as GameContentItem[]
    }
    
    // If parsed data itself is a single game content item
    if (parsed.type && parsed.data) {
      return [parsed as GameContentItem]
    }
    
    // Try to find other common properties
    for (const key of ['items', 'games', 'questions', 'results']) {
      if (Array.isArray(parsed[key])) {
        return parsed[key] as GameContentItem[]
      }
    }
    
    console.warn('Could not extract game content from parsed JSON')
    return []
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return []
  }
}

/**
 * Normalizes the response from n8n to ensure it's in the correct format
 */
function normalizeResponse(data: any): GameContentItem[] {
  console.log('Raw n8n response:', data)
  
  // Handle nested structure: data[0].content.parts[0].text
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0]
    
    // Check for nested structure: content.parts[0].text
    if (firstItem?.content?.parts && Array.isArray(firstItem.content.parts) && firstItem.content.parts.length > 0) {
      const textContent = firstItem.content.parts[0]?.text
      
      if (textContent && typeof textContent === 'string') {
        console.log('Found text content in nested structure:', textContent.substring(0, 200) + '...')
        
        // Extract and parse JSON from the text
        const jsonString = extractJsonFromMarkdown(textContent)
        const gameContent = parseGameContent(jsonString)
        
        if (gameContent.length > 0) {
          return gameContent
        }
      }
    }
    
    // If first item has a text property directly
    if (firstItem?.text && typeof firstItem.text === 'string') {
      console.log('Found text content directly:', firstItem.text.substring(0, 200) + '...')
      const jsonString = extractJsonFromMarkdown(firstItem.text)
      const gameContent = parseGameContent(jsonString)
      
      if (gameContent.length > 0) {
        return gameContent
      }
    }
  }
  
  // If data is already an array of GameContentItems, return it
  if (Array.isArray(data)) {
    // Check if it's already in the correct format
    if (data.length > 0 && data[0].type && data[0].data) {
      return data as GameContentItem[]
    }
  }
  
  // If data has a content property that's an array
  if (data.content && Array.isArray(data.content)) {
    return data.content as GameContentItem[]
  }
  
  // If data has a content property that's an object, wrap it in an array
  if (data.content && typeof data.content === 'object') {
    return [data.content as GameContentItem]
  }
  
  // If data itself is an object with type and data properties, wrap it
  if (data.type && data.data) {
    return [data as GameContentItem]
  }
  
  // If data is an object but not in expected format, try to extract content
  if (typeof data === 'object') {
    // Check for common response formats
    const keys = Object.keys(data)
    if (keys.length > 0) {
      // Try to find content-like properties
      for (const key of ['items', 'games', 'questions', 'results', 'tasks']) {
        if (Array.isArray(data[key])) {
          return data[key] as GameContentItem[]
        }
      }
    }
  }
  
  // If we can't normalize, return empty array
  console.warn('Could not normalize n8n response, returning empty array')
  return []
}

export async function sendTextToN8N(text: string): Promise<N8NResponse> {
  try {
    console.log('Sending text to n8n webhook:', N8N_WEBHOOK_URL)
    console.log('Text length:', text.length, 'characters')
    const data = { "text": text,"level":1,"timestamp":new Date().toISOString() }
    
    const response = await axios.post(N8N_WEBHOOK_URL, {
      data
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
    })

    console.log('n8n response status:', response.status)
    console.log('n8n response data:', response.data)
    
    // Normalize the response to ensure it's in the correct format
    const normalizedContent = normalizeResponse(response.data)
    
    if (normalizedContent.length === 0) {
      console.warn('No content found in n8n response')
      return {
        success: false,
        error: 'No game content was generated. Please check your n8n workflow response format.',
      }
    }
    
    console.log('Normalized content:', normalizedContent)
    console.log('Number of content items:', normalizedContent.length)
    
    return {
      success: true,
      content: normalizedContent,
    }
  } catch (error: any) {
    console.error('Error sending text to n8n:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })
    
    let errorMessage = 'Failed to process text with n8n'
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    `Server error: ${error.response.status} ${error.response.statusText}`
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from n8n webhook. Please check if your n8n workflow is running and the URL is correct.'
    } else {
      // Something else happened
      errorMessage = error.message || 'An unexpected error occurred'
    }
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

