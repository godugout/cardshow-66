import { supabase } from '@/integrations/supabase/client'

export interface CardAnalysisResult {
  cardType: string
  manufacturer: string
  playerName?: string
  teamName?: string
  year?: string
  set?: string
  sport?: string
  category: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  detectedText: string[]
  logos: string[]
  description: string
  suggestedTags: string[]
  confidence: number
}

export interface AnalysisResponse {
  success: boolean
  analysis?: CardAnalysisResult
  metadata?: {
    model: string
    timestamp: string
  }
  error?: string
  details?: string
}

export const analyzeCardImage = async (
  imageUrl?: string,
  imageData?: string
): Promise<AnalysisResponse> => {
  try {
    if (!imageUrl && !imageData) {
      throw new Error('Either imageUrl or imageData is required')
    }

    console.log('Sending image for Gemini analysis...')

    const { data, error } = await supabase.functions.invoke('analyze-card-image', {
      body: {
        imageUrl,
        imageData
      }
    })

    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to analyze image')
    }

    if (!data.success) {
      throw new Error(data.error || 'Analysis failed')
    }

    console.log('Analysis result:', data.analysis)

    return {
      success: true,
      analysis: data.analysis,
      metadata: data.metadata
    }

  } catch (error) {
    console.error('Card analysis error:', error)
    return {
      success: false,
      error: 'Failed to analyze card image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to convert image file to base64
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Return just the base64 data without the data URL prefix
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Enhanced metadata generation based on analysis
export const generateEnhancedMetadata = (analysis: CardAnalysisResult) => {
  const tags = [
    ...analysis.suggestedTags,
    analysis.rarity,
    ...(analysis.sport ? [analysis.sport] : []),
    ...(analysis.manufacturer !== 'unknown' ? [analysis.manufacturer.toLowerCase()] : []),
    ...(analysis.year ? [analysis.year] : []),
    'ai-analyzed'
  ].filter(Boolean)

  const title = analysis.playerName 
    ? `${analysis.playerName}${analysis.year ? ` ${analysis.year}` : ''}${analysis.set ? ` ${analysis.set}` : ''}`
    : analysis.cardType

  const description = analysis.description || 
    `A ${analysis.rarity} ${analysis.cardType}${analysis.manufacturer !== 'unknown' ? ` by ${analysis.manufacturer}` : ''}${analysis.sport ? ` from ${analysis.sport}` : ''}.`

  return {
    title,
    description,
    tags: [...new Set(tags)], // Remove duplicates
    category: analysis.category,
    rarity: analysis.rarity,
    detectedElements: {
      text: analysis.detectedText,
      logos: analysis.logos,
      manufacturer: analysis.manufacturer,
      confidence: analysis.confidence
    }
  }
}