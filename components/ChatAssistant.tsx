
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage, Language } from '../types';

interface ChatAssistantProps {
  language: Language;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize and update welcome message when language changes
  useEffect(() => {
    let welcomeText = 'Hello! I am your digital assistant. How can I help you today with farming, banking, or health?';

    switch (language) {
      case Language.HINDI:
        welcomeText = 'नमस्ते! मैं आपकी डिजिटल सहायिका हूँ। मैं आपकी कैसे मदद कर सकती हूँ?';
        break;
      case Language.TELUGU:
        welcomeText = 'నమస్కారం! నేను మీ డిజిటల్ సహాయకుడిని. నేను మీకు ఎలా సహాయం చేయగలను?';
        break;
      case Language.TAMIL:
        welcomeText = 'வணக்கம்! நான் உங்கள் டிஜிட்டல் உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?';
        break;
      case Language.MALAYALAM:
        welcomeText = 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഡിജിറ്റൽ സഹായിയാണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?';
        break;
    }

    // Reset messages when language changes to provide the correct welcome
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [language]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    switch (language) {
        case Language.HINDI: return "यहाँ टाइप करें...";
        case Language.TELUGU: return "ఇక్కడ టైప్ చేయండి...";
        case Language.TAMIL: return "இங்கே தட்டச்சு செய்யவும்...";
        case Language.MALAYALAM: return "ഇവിടെ ടൈപ്പ് ചെയ്യുക...";
        default: return "Ask a question...";
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 flex items-center justify-center transition-all hover:scale-105 z-50"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200">
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-semibold">Sahayak (AI Assistant)</h3>
                <p className="text-xs text-emerald-100">Always here to help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-emerald-500/50 p-1 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="animate-spin text-emerald-600" size={16} />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={getPlaceholder()}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="rounded-full !w-10 !h-10 !p-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
