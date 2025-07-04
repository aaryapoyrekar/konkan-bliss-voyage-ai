import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Mic, MicOff, Bot, User, Volume2, VolumeX, Sparkles, MapPin, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  error?: boolean;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Namaste! 🙏 I'm KonkanBot, your AI travel guide powered by Google Gemini. I can help you with travel planning, local information, historical facts, and recommendations for the beautiful Konkan coast. What would you like to know?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const quickQuestions = [
    "Best time to visit Konkan?",
    "Top beaches in Sindhudurg",
    "Local Malvani cuisine",
    "Historical places to visit",
    "Water sports activities",
    "Budget travel tips",
    "Scuba diving in Tarkarli",
    "Sindhudurg Fort history"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get user's location for better recommendations
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          console.log('📍 User location obtained:', `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        },
        (error) => {
          console.log("📍 Location access denied or unavailable:", error);
        }
      );
    }

    // Test connection to Gemini API
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔍 Testing Gemini API connection...');
      setConnectionStatus('checking');
      
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          messages: [{ role: 'user', content: 'test' }]
        }
      });

      console.log('🔍 Connection test result:', { data, error });

      if (error) {
        console.error('❌ Connection test failed:', error);
        setConnectionStatus('error');
      } else if (data?.response || data?.error) {
        console.log('✅ Connection test successful');
        setConnectionStatus('connected');
      } else {
        console.log('⚠️ Unexpected response format');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('💥 Connection test error:', error);
      setConnectionStatus('error');
    }
  };

  const callGeminiAPI = async (chatHistory: Message[]): Promise<string> => {
    try {
      console.log('🚀 Calling Gemini API with', chatHistory.length, 'messages');
      console.log('📤 Request payload:', {
        messages: chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        userLocation: userLocation || undefined
      });

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          messages: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userLocation: userLocation || undefined
        }
      });

      console.log('📥 Supabase function response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to call Gemini API');
      }

      if (data?.error) {
        console.error('❌ Gemini API error from server:', data.error);
        // If there's an error but also a response, use the response (fallback)
        if (data.response) {
          console.log('✅ Using fallback response');
          return data.response;
        }
        throw new Error(data.error);
      }

      if (!data?.response) {
        console.error('❌ No response from Gemini API');
        throw new Error('No response received from AI service');
      }

      console.log('✅ Successfully received response:', data.response.substring(0, 100) + '...');
      return data.response;
    } catch (error) {
      console.error('💥 Error calling Gemini API:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log('📝 Sending message:', inputMessage);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get the last 10 messages for context (to avoid token limits)
      const recentMessages = newMessages.slice(-10);
      console.log('🔄 Processing', recentMessages.length, 'recent messages');
      
      const botResponse = await callGeminiAPI(recentMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConnectionStatus('connected');

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(botResponse);
      }

      // Save chat log to database (optional)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('chat_logs').insert({
            user_id: user.id,
            question: userMessage.content,
            response: botResponse
          });
          console.log('💾 Chat log saved to database');
        }
      } catch (dbError) {
        console.log('⚠️ Failed to save chat log:', dbError);
        // Don't show error to user as this is not critical
      }

    } catch (error) {
      console.error('💥 Error getting bot response:', error);
      setConnectionStatus('error');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment! In the meantime, I'd love to help you plan your Konkan adventure - ask me about beaches, food, or activities! 🏖️",
        role: 'assistant',
        timestamp: new Date(),
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Unable to connect to the AI service. Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        console.log('🎤 Voice recognition started');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input:', transcript);
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Voice recognition ended');
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Remove emojis and clean text for better speech
      const cleanText = text.replace(/[^\w\s.,!?-]/g, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🔊 Text-to-speech started');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('🔊 Text-to-speech ended');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error('🔊 Text-to-speech error');
      };

      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('🔊 Text-to-speech stopped');
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700 border-0 px-4 py-2">
            <Sparkles className="mr-2" size={16} />
            AI Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 border-0 px-4 py-2">
            <AlertCircle className="mr-2" size={16} />
            AI Offline
          </Badge>
        );
      case 'checking':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0 px-4 py-2">
            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Connecting...
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-konkan-turquoise-50 via-white to-konkan-orange-50">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-konkan-turquoise-600 via-konkan-orange-500 to-konkan-forest-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                KonkanBot AI Assistant
              </h1>
              <p className="text-xl mb-6 max-w-2xl mx-auto">
                Powered by Google Gemini 1.5 Flash - Get instant, intelligent answers about Konkan travel
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {getConnectionStatusBadge()}
                <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                  <Volume2 className="mr-2" size={16} />
                  Voice Enabled
                </Badge>
                {userLocation && (
                  <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                    <MapPin className="mr-2" size={16} />
                    Location Aware
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Chat Interface */}
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl h-[600px] flex flex-col rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-white/20 bg-gradient-to-r from-konkan-turquoise-50 to-konkan-orange-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">KonkanBot</h3>
                    <p className="text-sm text-gray-600">Powered by Google Gemini 1.5 Flash</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`rounded-xl transition-all duration-200 ${voiceEnabled ? 'bg-konkan-turquoise-50 text-konkan-turquoise-600 border-konkan-turquoise-200' : ''}`}
                  >
                    {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </Button>
                  {isSpeaking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopSpeaking}
                      className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    disabled={connectionStatus === 'checking'}
                    className="rounded-xl"
                  >
                    Test AI
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-white/30">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-konkan-orange-500 to-konkan-orange-600' 
                            : message.error
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-konkan-turquoise-500 to-konkan-turquoise-600'
                        }`}>
                          {message.role === 'user' ? 
                            <User className="text-white" size={16} /> : 
                            message.error ? 
                            <AlertCircle className="text-white" size={16} /> :
                            <Bot className="text-white" size={16} />
                          }
                        </div>
                        <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-konkan-orange-500 to-konkan-orange-600 text-white'
                            : message.error
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-white/90 backdrop-blur-md border border-white/30 text-gray-800'
                        }`}>
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-2 opacity-70 ${
                            message.role === 'user' ? 'text-orange-100' : 
                            message.error ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {message.error && ' • Error'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-konkan-turquoise-500 to-konkan-turquoise-600 flex items-center justify-center shadow-lg">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="bg-white/90 backdrop-blur-md border border-white/30 p-4 rounded-2xl shadow-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-konkan-turquoise-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-konkan-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-konkan-forest-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-6 py-4 border-t border-white/20 bg-white/80 backdrop-blur-sm">
                <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <motion.button
                      key={question}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleQuickQuestion(question)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-konkan-turquoise-100 text-konkan-turquoise-700 text-xs rounded-full hover:bg-konkan-turquoise-200 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/20 bg-white/90 backdrop-blur-sm">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about Konkan..."
                      className="pr-12 rounded-2xl border-konkan-turquoise-200 focus:border-konkan-turquoise-400 bg-white/90 backdrop-blur-sm focus:bg-white transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startListening}
                      disabled={isListening || isLoading}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl transition-all duration-200 ${
                        isListening ? 'text-red-500 bg-red-50' : 'text-konkan-turquoise-600 hover:bg-konkan-turquoise-50'
                      }`}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 hover:from-konkan-turquoise-600 hover:to-konkan-orange-600 text-white rounded-2xl px-6 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Features Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-konkan-sand-50 border border-konkan-sand-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-konkan-sand-800 mb-2">
              🤖 Google Gemini 1.5 Flash Integration
            </h3>
            <p className="text-konkan-sand-700 mb-3">
              This chatbot is powered by Google's latest Gemini 1.5 Flash model, providing:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-konkan-sand-700">
              <li>• Real-time AI responses about Konkan tourism</li>
              <li>• Context-aware conversations with memory</li>
              <li>• Location-based recommendations</li>
              <li>• Voice input and text-to-speech output</li>
              <li>• Specialized knowledge about Konkan coast</li>
              <li>• Integration with your travel preferences</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Setup Required:</strong> Add your Google Gemini API key to the .env file to activate the AI chatbot. 
                Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChatBot;