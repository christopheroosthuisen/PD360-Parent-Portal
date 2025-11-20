


import React, { useState, useRef, useEffect } from 'react';
import { generateContent } from '../services/gemini';
import { DogData, CoachConversation, ChatMessage } from '../types';
import { getCurrentGrade, SKILL_TREE, TRAINER_NOTES, MOCK_COACHES, SUBSCRIPTION_TIERS } from '../constants';
import { MessageCircle, X, Send, Loader, ChevronUp, Maximize2, Minimize2, Bot, User, Search, Plus, Check, CreditCard, Calendar } from 'lucide-react';
import { Button, Card } from './UI';

interface IzzyChatProps {
  dogData: DogData;
}

export const IzzyChat: React.FC<IzzyChatProps> = ({ dogData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'coach'>('ai');
  
  // --- AI STATE ---
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Hi! I'm Izzy, your Partners Dogs 360 guide. 🐾\n\nI can help you analyze training videos, interpret behavior scores, or suggest homework exercises. What's on your mind?` }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // --- COACH CHAT STATE ---
  const [coachView, setCoachView] = useState<'inbox' | 'chat' | 'new'>('inbox');
  const [conversations, setConversations] = useState<CoachConversation[]>([
      {
          id: 'c1',
          coachId: 'coach_mike',
          coachName: 'Mike (Senior Trainer)',
          coachAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
          lastMessage: "You're doing great with the Place command!",
          lastMessageTime: '2h ago',
          unreadCount: 0,
          messages: [
              { id: 'm1', sender: 'coach', text: "Hey! How is Barnaby doing with the new homework?", timestamp: '10:00 AM' },
              { id: 'm2', sender: 'user', text: "Really good! He held place for 5 mins.", timestamp: '10:15 AM' },
              { id: 'm3', sender: 'coach', text: "That's awesome! Keep pushing the duration.", timestamp: '10:20 AM' }
          ]
      }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [coachInput, setCoachInput] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const coachMessagesEndRef = useRef<HTMLDivElement>(null);

  const IZZY_AVATAR = "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=100&h=100";

  // --- SCROLL HELPERS ---
  const scrollToBottom = () => {
    if (activeTab === 'ai') {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (activeTab === 'coach' && coachView === 'chat') {
        coachMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [aiMessages, conversations, isOpen, activeTab, coachView]);

  // --- LISTENERS ---
  useEffect(() => {
    const handleAskIzzy = (event: CustomEvent) => {
      const { message, autoSend } = event.detail;
      setIsOpen(true);
      setActiveTab('ai');
      if (autoSend) {
        handleAiSend(message);
      } else {
        setAiInput(message);
      }
    };

    window.addEventListener('ask-izzy' as any, handleAskIzzy as any);
    return () => {
      window.removeEventListener('ask-izzy' as any, handleAskIzzy as any);
    };
  }, [dogData]);

  // --- AI LOGIC ---
  const handleAiSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || aiInput;
    if (!textToSend.trim()) return;

    setAiMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setAiInput('');
    setIsAiTyping(true);

    try {
        const gradeInfo = getCurrentGrade(dogData.currentScore);
        const context = `
          Dog: ${dogData.name}
          Current Score: ${dogData.currentScore}
          Current Grade: ${gradeInfo.current.name}
          You are Izzy, the AI assistant for Partners Dogs 360.
        `;
        const response = await generateContent(textToSend, "gemini-3-pro-preview", context);
        setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
        setAiMessages(prev => [...prev, { role: 'ai', text: "I'm having a little trouble connecting right now." }]);
    } finally {
        setIsAiTyping(false);
    }
  };

  // --- COACH LOGIC ---
  const handleCoachSend = () => {
      if (!coachInput.trim() || !activeConversationId) return;
      
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: coachInput,
          timestamp: 'Just now'
      };

      setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
              return {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastMessage: newMessage.text,
                  lastMessageTime: 'Just now'
              };
          }
          return c;
      }));
      setCoachInput('');
  };

  const startNewChat = (coachId: string, coachName: string, coachAvatar: string) => {
      // Check if conversation exists
      const existing = conversations.find(c => c.coachId === coachId);
      if (existing) {
          setActiveConversationId(existing.id);
          setCoachView('chat');
          return;
      }
      
      // Create new (Mock)
      const newConv: CoachConversation = {
          id: `c_${Date.now()}`,
          coachId,
          coachName,
          coachAvatar,
          lastMessage: 'Start of conversation',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: []
      };
      setConversations([...conversations, newConv]);
      setActiveConversationId(newConv.id);
      setCoachView('chat');
  };

  // --- RENDER COMPONENTS ---

  // 1. Floating Button
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-pd-darkblue text-pd-teal rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 border-4 border-pd-teal group overflow-hidden"
      >
        <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
        {conversations.some(c => c.unreadCount > 0) && (
           <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-white"></div>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 overflow-hidden border-2 border-pd-darkblue
      ${isExpanded ? 'inset-6 md:inset-20 rounded-3xl' : 'bottom-8 right-8 w-[90vw] md:w-[420px] h-[650px] rounded-3xl'}
    `}>
      {/* Header */}
      <div className="bg-pd-darkblue p-4 shrink-0 border-b-4 border-pd-teal flex flex-col gap-3">
         <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-pd-lightest">
                    <img src={activeTab === 'ai' ? IZZY_AVATAR : conversations[0].coachAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-impact text-xl tracking-wide leading-none">{activeTab === 'ai' ? 'IZZY AI' : 'COACH CHAT'}</h3>
                    <p className="text-[10px] text-pd-teal font-bold uppercase tracking-wider">
                        {activeTab === 'ai' ? 'Always Online' : 'PDU Alumni Network'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-pd-lightest">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:text-white hover:bg-white/10 rounded"><Maximize2 size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white hover:bg-white/10 rounded"><ChevronUp size={24} className="rotate-180" /></button>
            </div>
         </div>

         {/* Custom Slider / Tab Switcher */}
         <div className="bg-black/20 p-1 rounded-xl flex relative">
             <button 
               onClick={() => setActiveTab('ai')}
               className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'ai' ? 'bg-white text-pd-darkblue shadow-md' : 'text-pd-lightest hover:text-white'}`}
             >
                <Bot size={16} /> Izzy AI
             </button>
             <button 
               onClick={() => setActiveTab('coach')}
               className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'coach' ? 'bg-white text-pd-darkblue shadow-md' : 'text-pd-lightest hover:text-white'}`}
             >
                <User size={16} /> Coaches
             </button>
         </div>
      </div>

      {/* BODY: AI CHAT */}
      {activeTab === 'ai' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-pd-lightest custom-scrollbar">
                {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-pd-darkblue flex items-center justify-center text-white shrink-0 mr-2 mt-auto mb-1 overflow-hidden border border-pd-lightest">
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
                {isAiTyping && (
                <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-pd-darkblue mr-2"></div>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-pd-lightest flex gap-1.5">
                        <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
                )}
                <div ref={aiMessagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t-2 border-pd-lightest shrink-0">
                <div className="flex gap-2">
                <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask Izzy anything..."
                    autoFocus
                    className="flex-1 bg-pd-lightest border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-pd-teal focus:bg-white transition-all text-pd-darkblue placeholder-pd-softgrey font-medium"
                />
                <Button onClick={() => handleAiSend()} className="!px-4 !py-2" disabled={isAiTyping}>
                    {isAiTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                </Button>
                </div>
            </div>
          </>
      )}

      {/* BODY: COACH CHAT */}
      {activeTab === 'coach' && (
          <div className="flex flex-col h-full bg-pd-lightest/30">
              
              {/* VIEW: INBOX */}
              {coachView === 'inbox' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {conversations.map(conv => (
                          <div 
                            key={conv.id}
                            onClick={() => { setActiveConversationId(conv.id); setCoachView('chat'); }}
                            className="bg-white p-4 rounded-2xl border-2 border-pd-lightest shadow-sm hover:border-pd-teal cursor-pointer transition-all group"
                          >
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                      <img src={conv.coachAvatar} alt={conv.coachName} className="w-12 h-12 rounded-xl object-cover border border-pd-lightest" />
                                      <div>
                                          <h4 className="font-impact text-lg text-pd-darkblue tracking-wide">{conv.coachName}</h4>
                                          <p className="text-xs font-bold text-pd-teal uppercase tracking-wider">Active</p>
                                      </div>
                                  </div>
                                  <span className="text-xs text-pd-softgrey font-bold">{conv.lastMessageTime}</span>
                              </div>
                              <p className="text-sm text-pd-slate font-medium truncate">{conv.lastMessage}</p>
                          </div>
                      ))}

                      <Button variant="primary" className="w-full !py-4 mt-4" icon={Plus} onClick={() => setCoachView('new')}>
                          New Chat
                      </Button>
                  </div>
              )}

              {/* VIEW: CHAT */}
              {coachView === 'chat' && activeConversationId && (
                  <>
                    <div className="bg-white border-b border-pd-lightest p-3 flex items-center justify-between shrink-0">
                        <button onClick={() => setCoachView('inbox')} className="text-pd-softgrey hover:text-pd-darkblue font-bold text-sm flex items-center gap-1">
                            ← Inbox
                        </button>
                        <span className="font-impact text-pd-darkblue uppercase">
                            {conversations.find(c => c.id === activeConversationId)?.coachName}
                        </span>
                        <div className="w-8"></div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pd-lightest/50">
                        {conversations.find(c => c.id === activeConversationId)?.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-pd-teal text-white rounded-br-none' 
                                    : 'bg-white text-pd-slate rounded-bl-none border border-pd-lightest'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={coachMessagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t-2 border-pd-lightest shrink-0">
                        <div className="flex gap-2">
                        <input
                            type="text"
                            value={coachInput}
                            onChange={(e) => setCoachInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCoachSend()}
                            placeholder="Message your coach..."
                            className="flex-1 bg-pd-lightest border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-pd-teal focus:bg-white transition-all text-pd-darkblue placeholder-pd-softgrey font-medium"
                        />
                        <Button onClick={handleCoachSend} className="!px-4 !py-2">
                            <Send size={20} />
                        </Button>
                        </div>
                    </div>
                  </>
              )}

              {/* VIEW: NEW CHAT (SUBSCRIPTION / ALUMNI FINDER) */}
              {coachView === 'new' && (
                   <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
                       <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setCoachView('inbox')} className="text-pd-softgrey hover:text-pd-darkblue"><X size={20} /></button>
                            <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide">Find a Coach</h3>
                       </div>
                       
                       {/* Subscription Cards */}
                       <div className="flex gap-3 overflow-x-auto pb-4">
                           {SUBSCRIPTION_TIERS.map(tier => (
                               <div 
                                 key={tier.id}
                                 onClick={() => setSelectedTier(tier.id)}
                                 className={`min-w-[160px] p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col ${
                                     selectedTier === tier.id 
                                     ? 'border-pd-teal bg-pd-teal/5 shadow-md' 
                                     : 'border-pd-lightest hover:border-pd-softgrey'
                                 }`}
                               >
                                   <div className="mb-2">
                                       <h4 className="font-impact text-lg text-pd-darkblue uppercase">{tier.name}</h4>
                                       <div className="flex items-baseline gap-0.5">
                                           <span className="text-sm font-bold text-pd-softgrey">$</span>
                                           <span className="text-3xl font-impact text-pd-teal">{tier.price}</span>
                                           <span className="text-xs text-pd-softgrey font-bold">/mo</span>
                                       </div>
                                   </div>
                                   <ul className="space-y-1.5 mb-4 flex-1">
                                       {tier.features.map((feat, i) => (
                                           <li key={i} className="text-[10px] font-bold text-pd-slate flex items-center gap-1">
                                               <Check size={10} className="text-pd-teal" /> {feat}
                                           </li>
                                       ))}
                                   </ul>
                                   <div className={`w-5 h-5 rounded-full border-2 ml-auto flex items-center justify-center ${selectedTier === tier.id ? 'bg-pd-teal border-pd-teal' : 'border-pd-lightest'}`}>
                                       {selectedTier === tier.id && <Check size={12} className="text-white" />}
                                   </div>
                               </div>
                           ))}
                       </div>

                       {/* Coach List */}
                       <div className="space-y-3">
                           <h4 className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Available PDU Alumni</h4>
                           {MOCK_COACHES.map(coach => (
                               <div key={coach.id} className="flex items-center justify-between p-3 rounded-xl border border-pd-lightest bg-pd-lightest/10">
                                   <div className="flex items-center gap-3">
                                       <img src={coach.avatar} alt={coach.name} className="w-10 h-10 rounded-lg object-cover" />
                                       <div>
                                           <p className="font-bold text-pd-darkblue text-sm">{coach.name}</p>
                                           <p className="text-[10px] font-bold text-pd-teal uppercase tracking-wider">${coach.hourlyRate}/hr for calls</p>
                                       </div>
                                   </div>
                                   <button 
                                     onClick={() => startNewChat(coach.id, coach.name, coach.avatar)}
                                     className="p-2 bg-pd-darkblue text-white rounded-lg hover:bg-pd-teal transition-colors"
                                   >
                                       <MessageCircle size={16} />
                                   </button>
                               </div>
                           ))}
                       </div>
                   </div>
              )}
          </div>
      )}
    </div>
  );
};
