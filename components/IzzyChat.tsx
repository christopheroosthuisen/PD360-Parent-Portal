
import React, { useState, useRef, useEffect } from 'react';
import { generateContent } from '../services/gemini';
import { DogData } from '../types';
import { getCurrentGrade, SKILL_TREE } from '../constants';
import { MessageCircle, X, Send, Loader, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './UI';

interface IzzyChatProps {
  dogData: DogData;
}

export const IzzyChat: React.FC<IzzyChatProps> = ({ dogData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Hi! I'm Izzy, your Partners Dogs 360 guide. 🐾\n\nI can help you analyze training videos, interpret behavior scores, or suggest homework exercises. What's on your mind?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // German Shepherd Image URL for Izzy
  const IZZY_AVATAR = "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=100&h=100";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Listen for external triggers
  useEffect(() => {
    const handleAskIzzy = (event: CustomEvent) => {
      const { message, autoSend } = event.detail;
      setIsOpen(true);
      if (autoSend) {
        handleSend(message);
      } else {
        setInput(message);
      }
    };

    window.addEventListener('ask-izzy' as any, handleAskIzzy as any);
    return () => {
      window.removeEventListener('ask-izzy' as any, handleAskIzzy as any);
    };
  }, [dogData]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userText = textToSend;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
        const gradeInfo = getCurrentGrade(dogData.currentScore);

        const context = `
          Dog: ${dogData.name}
          Current Score: ${dogData.currentScore}
          Current Grade: ${gradeInfo.current.name}
          
          Navigation Context:
          - Dashboard: Overview of progress, grades, and recent activity.
          - Skills & Progress: Detailed breakdown of all skills (Standard & Inappropriate behaviors), search and filtering.
          - Media Analysis: Upload photos or videos for AI analysis of body language and mechanics.
          - Homework: Generate custom training plans.
          - Knowledge: Access Partners University and Knowledge Base.
          
          You are Izzy, the AI assistant for Partners Dogs 360.
          Your tone is encouraging, professional, and knowledgeable about dog training.
          Use the 'Teaching', 'Reinforcing', 'Proofing', 'Maintenance' terminology for standard skills.
          Use 'Frequent' to 'Never' scale for inappropriate behaviors.
          
          If the user asks to analyze a video or photo, guide them to the "Media Analysis" page.
          If the user wants a training plan, guide them to the "Homework" page.
        `;

        const response = await generateContent(userText, "gemini-3-pro-preview", context);
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'ai', text: "I'm having a little trouble connecting right now. Try again in a moment!" }]);
    } finally {
        setIsTyping(false);
    }
  };

  // Floating Button State
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-pd-darkblue text-pd-teal rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 border-4 border-pd-teal group overflow-hidden"
      >
        <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pd-yellow rounded-full border-4 border-white"></div>
      </button>
    );
  }

  // Chat Window State
  return (
    <div className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 overflow-hidden border-2 border-pd-darkblue
      ${isExpanded ? 'inset-6 md:inset-20 rounded-3xl' : 'bottom-8 right-8 w-[90vw] md:w-[420px] h-[650px] rounded-3xl'}
    `}>
      {/* Header */}
      <div className="bg-pd-darkblue text-white p-5 flex items-center justify-between shrink-0 border-b-4 border-pd-teal">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-pd-darkblue font-bold shadow-lg overflow-hidden border-2 border-pd-lightest">
             <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-impact text-2xl tracking-wide leading-none">IZZY</h3>
            <p className="text-xs text-pd-teal font-bold uppercase tracking-wider">AI Guide</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-pd-lightest">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:text-white transition hover:bg-white/10 rounded">
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white transition hover:bg-white/10 rounded">
            <ChevronUp size={24} className="rotate-180" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-pd-lightest">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
               <div className="w-8 h-8 rounded-full bg-pd-darkblue flex items-center justify-center text-white shrink-0 mr-2 mt-auto mb-1 shadow-sm overflow-hidden border border-pd-lightest">
                 <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
               </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
              msg.role === 'user' 
                ? 'bg-white text-pd-darkblue rounded-br-none border-2 border-pd-teal' 
                : 'bg-white border border-pd-lightest text-pd-slate rounded-bl-none'
            }`}>
              <div className="markdown-prose whitespace-pre-wrap">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-pd-darkblue flex items-center justify-center text-white shrink-0 mr-2 mt-auto mb-1 overflow-hidden border border-pd-lightest">
               <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-pd-lightest flex gap-1.5">
              <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t-2 border-pd-lightest shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Izzy anything..."
            autoFocus
            className="flex-1 bg-pd-lightest border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-pd-teal focus:bg-white transition-all text-pd-darkblue placeholder-pd-softgrey font-medium"
          />
          <Button onClick={() => handleSend()} className="!px-4 !py-2" disabled={isTyping}>
             {isTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
