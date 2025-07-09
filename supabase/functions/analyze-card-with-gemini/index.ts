import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, imageUrl } = await req.json();

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Use either base64 imageData or imageUrl
    let imageContent;
    if (imageData) {
      imageContent = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/... prefix
          mimeType: 'image/jpeg'
        }
      };
    } else if (imageUrl) {
      // For URL-based images, we need to fetch and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBlob)));
      imageContent = {
        inlineData: {
          data: base64,
          mimeType: imageResponse.headers.get('content-type') || 'image/jpeg'
        }
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this trading card image and provide detailed information. Look for:

1. Main subject/character: Who or what is the primary focus?
2. Sport/activity: What sport or activity is shown?
3. Action/pose: What is happening in the image?
4. Setting/background: Where was this taken?
5. Notable features: Any special equipment, uniforms, or details?
6. Emotional tone: What mood or feeling does this convey?
7. Text/numbers: Any visible text, names, or numbers?
8. Card category: Sports, gaming, entertainment, art, or other?

Provide a response in this JSON format:
{
  "title": "Suggested card title (max 50 characters)",
  "description": "Detailed description (100-200 words)",
  "category": "sports|gaming|entertainment|art|other",
  "subject": "Main subject/person",
  "sport": "Sport or activity if applicable",
  "action": "Action being performed",
  "setting": "Location/background",
  "mood": "Emotional tone",
  "confidence": 0.85,
  "suggestions": ["Additional suggestion 1", "Additional suggestion 2"]
}`
            },
            imageContent
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1000,
        }
      }),
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from Gemini AI');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON response
    let analysisResult;
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      analysisResult = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, create structured response from text
      analysisResult = {
        title: 'AI-Analyzed Trading Card',
        description: aiResponse.substring(0, 200) + '...',
        category: 'other',
        subject: 'Unknown',
        sport: null,
        action: 'Unknown',
        setting: 'Unknown',
        mood: 'Unknown',
        confidence: 0.5,
        suggestions: ['Custom trading card', 'Unique collectible']
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    
    // Return default values on error
    const defaultResponse = {
      title: 'Custom Trading Card',
      description: 'A unique collectible card with custom artwork.',
      category: 'other',
      subject: 'Unknown',
      sport: null,
      action: 'Unknown',
      setting: 'Unknown', 
      mood: 'Unknown',
      confidence: 0.3,
      suggestions: ['Custom card', 'Unique collectible']
    };

    return new Response(JSON.stringify(defaultResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});