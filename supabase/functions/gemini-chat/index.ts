import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userLocation?: string;
}

serve(async (req) => {
  console.log(`🚀 Gemini Chat Function called - Method: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log(`❌ Invalid method: ${req.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('📥 Parsing request body...');
    const requestBody = await req.json();
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    
    const { messages, userLocation }: ChatRequest = requestBody;

    if (!messages || !Array.isArray(messages)) {
      console.log('❌ Invalid messages format:', messages);
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📨 Processing ${messages.length} messages`);
    console.log('🌍 User location:', userLocation || 'Not provided');

    // Check for API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    console.log('🔑 API Key status:', GEMINI_API_KEY ? 'Present' : 'Missing');
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
      console.log('❌ Gemini API key not configured properly');
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API key not configured. Please add your API key to the .env file.',
          response: 'I apologize, but the AI service is not properly configured. Please contact the administrator to set up the Gemini API key. In the meantime, I can provide some basic Konkan travel information! 🏖️'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare the system prompt for Konkan tourism
    const systemPrompt = `You are KonkanBot, an expert AI travel assistant specializing in the Konkan coast of Maharashtra, India. You have extensive knowledge about:

🏖️ BEACHES: Tarkarli, Malvan, Vengurla, Devbagh, Redi, Chivla, and other pristine beaches
🏰 HERITAGE: Sindhudurg Fort, Sawantwadi Palace, and historical sites built by Chhatrapati Shivaji Maharaj
🍽️ CUISINE: Authentic Malvani food, seafood specialties, sol kadhi, koliwada prawns, fish curry
🌊 ACTIVITIES: Scuba diving, water sports, dolphin watching, backwater cruises, fort exploration
🏞️ NATURE: Amboli waterfalls, Western Ghats, coconut groves, mangroves
🎭 CULTURE: Local festivals, traditional art, fishing communities, Konkani traditions

GUIDELINES:
- Always be enthusiastic and helpful about Konkan tourism
- Provide specific, actionable travel advice
- Include practical information like costs, timings, and contact details when relevant
- Suggest seasonal recommendations (best time to visit is October to March)
- Mention local transportation options and accommodation
- Be culturally sensitive and promote sustainable tourism
- If asked about places outside Konkan, gently redirect to Konkan alternatives
- Use emojis to make responses engaging
- Keep responses concise but informative (max 300 words)

${userLocation ? `The user is currently located in: ${userLocation}` : ''}

Respond in a friendly, knowledgeable manner as if you're a local guide who loves sharing the beauty of Konkan with visitors.`;

    // Convert chat history to Gemini format
    const geminiMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Namaste! 🙏 I\'m KonkanBot, your friendly AI guide to the beautiful Konkan coast! I\'m here to help you discover pristine beaches, historic forts, delicious Malvani cuisine, and amazing experiences along Maharashtra\'s stunning coastline. What would you like to know about Konkan?' }]
      }
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentMessages = messages.slice(-10);
    recentMessages.forEach(msg => {
      geminiMessages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    console.log(`🤖 Calling Gemini API with ${geminiMessages.length} messages...`);

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestPayload = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('📤 Sending request to Gemini API...');
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    console.log(`📥 Gemini API response status: ${geminiResponse.status}`);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('❌ Gemini API error:', errorText);
      
      // Provide a helpful fallback response
      const fallbackResponse = getFallbackResponse(messages[messages.length - 1]?.content || '');
      
      return new Response(
        JSON.stringify({ 
          error: `Gemini API error: ${geminiResponse.status}`,
          response: fallbackResponse,
          details: errorText 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log('📋 Gemini API response:', JSON.stringify(geminiData, null, 2));
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.log('❌ Invalid response structure from Gemini API');
      
      const fallbackResponse = getFallbackResponse(messages[messages.length - 1]?.content || '');
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Gemini API',
          response: fallbackResponse
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const botResponse = geminiData.candidates[0].content.parts[0].text;
    console.log('✅ Successfully generated response:', botResponse.substring(0, 100) + '...');

    if (!botResponse || botResponse.trim().length === 0) {
      console.log('❌ Empty response from Gemini API');
      const fallbackResponse = getFallbackResponse(messages[messages.length - 1]?.content || '');
      
      return new Response(
        JSON.stringify({ 
          error: 'Empty response from Gemini API',
          response: fallbackResponse
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        response: botResponse,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Error in gemini-chat function:', error);
    
    const fallbackResponse = 'I\'m sorry, I\'m experiencing some technical difficulties. Please try again in a moment! In the meantime, I\'d love to help you plan your Konkan adventure - ask me about beaches, food, or activities! 🏖️';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        response: fallbackResponse,
        details: error.message
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fallback responses for common queries
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('beach') || lowerMessage.includes('tarkarli') || lowerMessage.includes('malvan')) {
    return "🏖️ The Konkan coast has some of India's most pristine beaches! Tarkarli Beach is famous for its crystal-clear waters and water sports. Malvan Beach offers excellent scuba diving opportunities. For a peaceful experience, try Vengurla or Devbagh beaches. The best time to visit is October to March when the weather is pleasant.";
  }
  
  if (lowerMessage.includes('food') || lowerMessage.includes('cuisine') || lowerMessage.includes('malvani')) {
    return "🍽️ Malvani cuisine is a treat for seafood lovers! Must-try dishes include Koliwada prawns, fish curry with coconut, sol kadhi (kokum drink), and modak. Don't miss the famous Malvani fish thali. Popular restaurants include Chaitanya Restaurant in Malvan and Athithi Bamboo in Tarkarli.";
  }
  
  if (lowerMessage.includes('fort') || lowerMessage.includes('sindhudurg') || lowerMessage.includes('history')) {
    return "🏰 Sindhudurg Fort is a magnificent sea fort built by Chhatrapati Shivaji Maharaj in 1664. It's located on a rocky island and showcases brilliant Maratha architecture. The fort has temples, freshwater wells, and offers stunning sea views. Entry fee is ₹25 for Indians. Best visited during early morning or evening.";
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('when') || lowerMessage.includes('season')) {
    return "🌤️ The best time to visit Konkan is from October to March when the weather is pleasant and ideal for beach activities. Monsoon season (June-September) offers lush greenery and waterfalls but heavy rains. Summer (April-May) can be hot and humid. Winter months are perfect for water sports and sightseeing.";
  }
  
  return "🤔 I'm having trouble connecting to my AI brain right now, but I'd love to help you explore the Konkan coast! Could you ask me about beaches, food, historical places, activities, or travel tips? I have lots of local knowledge to share about this beautiful region! 🌊";
}