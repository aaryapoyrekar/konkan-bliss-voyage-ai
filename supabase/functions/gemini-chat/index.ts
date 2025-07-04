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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { messages, userLocation }: ChatRequest = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { 
          status: 500, 
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
- Keep responses concise but informative

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

    // Add conversation history
    messages.forEach(msg => {
      geminiMessages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from Gemini API',
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Gemini API',
          response: 'I apologize, but I\'m having trouble processing your request right now. Please try asking about Konkan beaches, food, or attractions!' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const botResponse = geminiData.candidates[0].content.parts[0].text;

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
    console.error('Error in gemini-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        response: 'I\'m sorry, I\'m experiencing some technical difficulties. Please try again in a moment! In the meantime, I\'d love to help you plan your Konkan adventure - ask me about beaches, food, or activities! 🏖️'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});