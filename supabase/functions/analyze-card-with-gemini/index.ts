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
    console.log('Received request with imageData length:', imageData?.length, 'imageUrl:', imageUrl?.substring(0, 100));

    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      throw new Error('Gemini API key not configured');
    }

    // Use either base64 imageData or imageUrl
    let imageContent;
    if (imageData) {
      // Handle data URLs properly
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const mimeType = imageData.includes('data:') ? 
        imageData.split(';')[0].replace('data:', '') : 'image/jpeg';
      
      imageContent = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
      console.log('Using base64 image data, mimeType:', mimeType);
    } else if (imageUrl) {
      console.log('Fetching image from URL:', imageUrl);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const imageBlob = await imageResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBlob)));
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      imageContent = {
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      };
      console.log('Converted URL image to base64, mimeType:', mimeType);
    } else {
      throw new Error('No image data or URL provided');
    }

    const requestBody = {
      contents: [{
        parts: [
          {
            text: `Analyze this trading card or sports card image in detail. Be very specific about what you see. Look for:

1. SPORT/ACTIVITY: What specific sport or activity is shown? (basketball, baseball, football, soccer, hockey, etc.)
2. PLAYER/SUBJECT: Can you identify the main person or subject? Look for jerseys, uniforms, equipment
3. ACTION: What specific action is being performed? (pitching, batting, running, jumping, celebrating, etc.)
4. TEAM/UNIFORM: What team colors, logos, or uniform details are visible?
5. SETTING: What type of venue or background? (stadium, field, court, outdoor, indoor, etc.)
6. EQUIPMENT: What sports equipment is visible? (ball, bat, gloves, helmet, etc.)
7. CARD DETAILS: Any visible text, numbers, logos, or card design elements?
8. QUALITY/STYLE: What type of photo is this? (action shot, portrait, vintage, modern, etc.)

Be VERY descriptive and specific. Don't say "Unknown" unless you truly cannot determine anything.

Return ONLY a valid JSON object in this exact format:
{
  "title": "Descriptive title based on what you see (max 50 chars)",
  "description": "Detailed 2-3 sentence description of exactly what you observe in the image",
  "category": "sports|gaming|entertainment|art|other",
  "subject": "The main person/character/subject you can identify",
  "sport": "Specific sport if applicable, null if not sports",
  "action": "Specific action being performed",
  "setting": "Specific location/background you can see",
  "mood": "Energy/mood of the image (dynamic, calm, intense, celebratory, etc.)",
  "confidence": 0.8,
  "suggestions": ["2-3 specific suggestions based on what you actually see"]
}`
          },
          imageContent
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    console.log('Sending request to Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0]) {
      console.error('No candidates in Gemini response:', data);
      throw new Error('No response from Gemini AI');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('AI response text:', aiResponse);
    
    // Try to parse JSON response
    let analysisResult;
    try {
      // Clean up the response - remove markdown formatting and extra whitespace
      let cleanedResponse = aiResponse.trim();
      
      // Remove markdown code blocks if present
      const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[1].trim();
      }
      
      // Find JSON object
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd);
        analysisResult = JSON.parse(jsonStr);
        console.log('Successfully parsed JSON:', analysisResult);
        
        // Ensure all required fields are present
        analysisResult = {
          title: analysisResult.title || 'Trading Card',
          description: analysisResult.description || 'A trading card with custom artwork.',
          category: analysisResult.category || 'other',
          subject: analysisResult.subject || 'Person',
          sport: analysisResult.sport || null,
          action: analysisResult.action || 'Posed',
          setting: analysisResult.setting || 'Studio',
          mood: analysisResult.mood || 'Professional',
          confidence: Math.max(0.7, analysisResult.confidence || 0.7),
          suggestions: analysisResult.suggestions || ['Trading card', 'Collectible item']
        };
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw response:', aiResponse);
      
      // Create structured response from text analysis
      analysisResult = {
        title: 'AI-Analyzed Trading Card',
        description: aiResponse.length > 200 ? aiResponse.substring(0, 200) + '...' : aiResponse,
        category: aiResponse.toLowerCase().includes('sport') ? 'sports' : 'other',
        subject: 'Person in image',
        sport: null,
        action: 'Posed for photo',
        setting: 'Professional photo',
        mood: 'Professional',
        confidence: 0.6,
        suggestions: ['Trading card', 'Collectible item', 'Custom card']
      };
    }

    console.log('Final analysis result:', analysisResult);
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing image with Gemini:', error.message);
    console.error('Full error:', error);
    
    // Return more informative default response
    const defaultResponse = {
      title: 'Custom Trading Card',
      description: `A trading card image that could not be analyzed due to: ${error.message}`,
      category: 'other',
      subject: 'Unknown',
      sport: null,
      action: 'Unknown',
      setting: 'Unknown', 
      mood: 'Unknown',
      confidence: 0.3,
      suggestions: ['Custom card', 'Unique collectible'],
      error: error.message
    };

    return new Response(JSON.stringify(defaultResponse), {
      status: 200, // Return 200 to avoid breaking the frontend
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});