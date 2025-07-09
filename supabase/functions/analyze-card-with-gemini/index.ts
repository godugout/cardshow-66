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
            text: `Analyze this image for creating an AMAZING trading card with ZERO user effort. Be extremely creative, detailed, and make card creation completely effortless! 

Examine EVERYTHING in the image and provide comprehensive analysis:

🔍 VISUAL ANALYSIS:
- Main subject/person/character and their details
- Dynamic action or pose happening  
- Sports/activity type and specific details
- Team colors, uniforms, equipment visible
- Setting, venue, background environment
- Lighting, composition, and visual appeal
- Any text, numbers, logos, or existing card elements

💡 CREATIVE SUGGESTIONS:
- Perfect catchy title that sells the card
- Compelling backstory description
- Best card frame style to match the vibe
- Ideal cropping focus for maximum impact
- Enhancement suggestions for wow factor
- Rarity level based on uniqueness/appeal

📊 MARKET INTELLIGENCE:
- Collector appeal and trending keywords
- Similar successful cards in the market
- Target audience and search optimization

Return ONLY a valid JSON object in this EXACT format:
{
  "title": "Creative, catchy card title (think like a pro card designer)",
  "description": "Compelling card description that tells a story (3-4 sentences max)",
  "category": "sports|gaming|entertainment|art|collectibles|other",
  "subject": "Main subject/person/character in the image",
  "sport": "Specific sport if applicable, null if not sports",
  "action": "Dynamic action or pose happening",
  "setting": "Detailed environment/location description",
  "mood": "Emotional tone and energy level",
  "colors": ["primary", "secondary", "accent", "colors"],
  "composition": "Visual composition and framing analysis",
  "rarity": "common|uncommon|rare|epic|legendary",
  "confidence": 0.95,
  "tags": ["sport", "action", "team", "relevant", "searchable", "tags"],
  "stats": {
    "overall_quality": 8,
    "visual_appeal": 9, 
    "card_potential": 7,
    "action_level": 6,
    "uniqueness": 8
  },
  "suggested_frame": "sports|modern|vintage|holographic|artistic",
  "auto_crop_suggestion": {
    "focus_area": "Description of what should be the main focus",
    "crop_style": "portrait|landscape|square|custom",
    "keep_elements": ["important", "elements", "to", "preserve"]
  },
  "enhancement_suggestions": {
    "brightness": 50,
    "contrast": 60, 
    "saturation": 55,
    "effects": ["suggested", "visual", "effects"]
  },
  "market_appeal": {
    "collector_interest": 8,
    "trending_keywords": ["popular", "search", "terms"],
    "similar_cards": "What this reminds me of in the trading card world"
  },
  "suggestions": ["Smart card creation tips", "Optimization advice", "Marketing suggestions"]
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
        
        // Ensure all required fields are present with enhanced data
        analysisResult = {
          title: analysisResult.title || 'AI-Enhanced Trading Card',
          description: analysisResult.description || 'A trading card with AI-optimized design and appeal.',
          category: analysisResult.category || 'other',
          subject: analysisResult.subject || 'Person',
          sport: analysisResult.sport || null,
          action: analysisResult.action || 'Dynamic pose',
          setting: analysisResult.setting || 'Professional setting',
          mood: analysisResult.mood || 'Dynamic',
          colors: analysisResult.colors || ['vibrant', 'professional'],
          composition: analysisResult.composition || 'Well-balanced composition',
          rarity: analysisResult.rarity || 'uncommon',
          confidence: Math.max(0.8, analysisResult.confidence || 0.8),
          tags: analysisResult.tags || ['trading', 'card', 'collectible'],
          stats: analysisResult.stats || {
            overall_quality: 8,
            visual_appeal: 7,
            card_potential: 8,
            action_level: 6,
            uniqueness: 7
          },
          suggested_frame: analysisResult.suggested_frame || 'modern',
          auto_crop_suggestion: analysisResult.auto_crop_suggestion || {
            focus_area: 'Center subject for maximum impact',
            crop_style: 'portrait',
            keep_elements: ['main subject', 'important details']
          },
          enhancement_suggestions: analysisResult.enhancement_suggestions || {
            brightness: 50,
            contrast: 55,
            saturation: 50,
            effects: ['clarity boost', 'color enhancement']
          },
          market_appeal: analysisResult.market_appeal || {
            collector_interest: 7,
            trending_keywords: ['trading card', 'collectible'],
            similar_cards: 'Modern collectible card'
          },
          suggestions: analysisResult.suggestions || ['Perfect for collectors', 'High visual appeal', 'Great design potential']
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