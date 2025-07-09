import React, { useState, useRef, useEffect } from 'react';
import { CRDCard } from '@/components/ui/design-system';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'dusty';
  content: string;
  timestamp: Date;
}

interface DustyChatProps {
  cardImage?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export const DustyChat: React.FC<DustyChatProps> = ({ cardImage, onAnalysisComplete }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'dusty',
      content: "Hey there! I'm Dusty, your AI card creation assistant! 🎯 I can help analyze your image and suggest amazing details for your trading card. What would you like me to help you with?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeImage = async () => {
    if (!cardImage) {
      addDustyMessage("I don't see an image to analyze yet! Upload one and I'll help you create an amazing card! 🎨");
      return;
    }

    setIsAnalyzing(true);
    addDustyMessage("🔍 Analyzing your image with my AI powers... This might take a moment!");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-card-with-gemini', {
        body: { imageUrl: cardImage }
      });

      if (error) throw error;

      const analysis = data;
      
      addDustyMessage(`🎉 Amazing! I found some great details about your image:

**Subject:** ${analysis.subject}
**Sport/Activity:** ${analysis.sport || 'General'}
**Action:** ${analysis.action}
**Setting:** ${analysis.setting}
**Mood:** ${analysis.mood}

**My Suggested Title:** "${analysis.title}"

**Description I wrote:** ${analysis.description}

I'm ${Math.round(analysis.confidence * 100)}% confident about this analysis! Should I auto-fill these details for you?`);

      onAnalysisComplete?.(analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      addDustyMessage("Oops! I had trouble analyzing your image. But don't worry - I can still help you create an awesome card manually! 🤖");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addDustyMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'dusty',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');

    // Simple AI responses based on keywords
    setTimeout(() => {
      if (userMessage.toLowerCase().includes('analyze') || userMessage.toLowerCase().includes('help')) {
        analyzeImage();
      } else if (userMessage.toLowerCase().includes('title') || userMessage.toLowerCase().includes('name')) {
        addDustyMessage("Great question about titles! I suggest making them descriptive but punchy. Think about the main action or emotion in your image. Want me to analyze your image for suggestions? 🎯");
      } else if (userMessage.toLowerCase().includes('description')) {
        addDustyMessage("For descriptions, I like to include the setting, action, and emotion. It helps collectors connect with the card! Should I analyze your image to write one for you? ✨");
      } else if (userMessage.toLowerCase().includes('category')) {
        addDustyMessage("I can detect categories like Sports, Gaming, Entertainment, Art, or Other. Each category has its own vibe! Want me to check your image and suggest the best category? 🏆");
      } else {
        addDustyMessage("That's interesting! I'm still learning, but I'm great at analyzing images and helping with card details. Try asking me to 'analyze my image' or ask about titles, descriptions, or categories! 🤖✨");
      }
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <CRDCard className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-crd-orange to-crd-green rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Dusty</h3>
          <p className="text-xs text-muted-foreground">AI Card Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'dusty' 
                  ? 'bg-gradient-to-br from-crd-orange to-crd-green' 
                  : 'bg-muted'
              }`}>
                {message.type === 'dusty' ? (
                  <Bot className="w-3 h-3 text-white" />
                ) : (
                  <User className="w-3 h-3 text-muted-foreground" />
                )}
              </div>

              {/* Message */}
              <div className={`rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-crd-green text-black'
                  : 'bg-muted text-white'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-crd-orange to-crd-green flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-crd-green rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-crd-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-crd-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2 mb-3">
          <button
            onClick={analyzeImage}
            disabled={!cardImage || isAnalyzing}
            className="px-3 py-1 bg-crd-green text-black text-xs rounded-full hover:bg-crd-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✨ Analyze Image
          </button>
          <button
            onClick={() => addDustyMessage("Here are some title ideas: 'Action Shot', 'Perfect Moment', 'Championship Play', 'Victory Pose'. What catches your eye in the image? 🎯")}
            className="px-3 py-1 bg-crd-orange text-white text-xs rounded-full hover:bg-crd-orange/90 transition-colors"
          >
            💡 Title Ideas
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Dusty anything..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-crd-green focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2 bg-crd-green text-black rounded-lg hover:bg-crd-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </CRDCard>
  );
};