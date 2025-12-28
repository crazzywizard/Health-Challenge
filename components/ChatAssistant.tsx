'use client';

import { useChat, type UIMessage } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, X, User, Sparkles } from 'lucide-react';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isReady, setIsReady] = useState(false);
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    const checkVisibility = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        const profileId = localStorage.getItem('current_profile_id');
        
        if (response.ok && data.authenticated && profileId) {
          setIsReady(true);
        } else {
          setIsReady(false);
        }
      } catch (error) {
        setIsReady(false);
      }
    };

    checkVisibility();
    
    // Listen for storage changes in case profile is selected later
    window.addEventListener('storage', checkVisibility);
    return () => window.removeEventListener('storage', checkVisibility);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const content = input;
    setInput('');
    sendMessage({ text: content });

    // Reset height of textarea if we can find it
    const textarea = (e.target as any).querySelector?.('textarea');
    if (textarea) textarea.style.height = 'auto';
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isReady) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg hover:scale-110 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-bounce" />
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] sm:w-[400px] max-h-[600px] glass rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform z-50 origin-bottom-right ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 gradient-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold leading-none">AI Assistant</h3>
              <p className="text-white/70 text-xs mt-1">Health & Wellness Guide</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">How can I help you today?</h4>
              <p className="text-text-secondary text-sm px-8">
                Ask me about workout tips, healthy recipes, or motivation for your challenge!
              </p>
            </div>
          )}
          {messages.map((m: UIMessage) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-text-primary rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {m.role === 'user' ? (
                    <User className="w-3 h-3 text-white/70" />
                  ) : (
                    <Bot className="w-3 h-3 text-primary" />
                  )}
                  <span className="text-[10px] font-bold uppercase opacity-70">
                    {m.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.parts.map((part: any, i: number) => {
                    if (part.type === 'text') {
                      return <span key={i}>{part.text}</span>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/5 border border-white/10 rounded-22xl rounded-tl-none p-4 w-24">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              rows={1}
              className="flex-1 bg-transparent border-none py-2 text-sm focus:outline-none resize-none min-h-[36px] max-h-[120px] scrollbar-hide"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 mb-1 flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
