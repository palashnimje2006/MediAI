import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  PhoneCall,
  Info,
} from 'lucide-react';
import { ChatMessage, Doctor } from '../types';

interface AiHealthAssistantScreenProps {
  onSelectDoctorByName?: (name: string) => void;
  onNavigateToSpecialty?: (specialty: string) => void;
  onOpenEmergency?: () => void;
}

export const AiHealthAssistantScreen: React.FC<AiHealthAssistantScreenProps> = ({
  onSelectDoctorByName,
  onNavigateToSpecialty,
  onOpenEmergency,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am **Medi AI**, your smart clinical guidance and symptom triage assistant.\n\nDescribe what you are experiencing (e.g. fever, headache, joint ache, chest discomfort), and I will explain possible causes, assess triage urgency, and recommend verified medical specialists from our network.\n\n*Note: Medi AI provides health education and is not a clinical diagnosis or medical prescription.*`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Throbbing headache with light sensitivity',
    'Mild chest tightness after brisk walking',
    'Dry itchy skin rash with red patches',
    'Fever and sore throat for 2 days',
    'Knee stiffness and joint pain when climbing stairs',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reach AI assistant');
      }

      const botMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        suggestedSpecialty: data.suggestedSpecialty,
        recommendedDoctors: data.recommendedDoctors,
        isEmergencyAlert: data.isEmergencyAlert,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, the AI service encountered a temporary error. Please consult a doctor directly or search our directory.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Chat history cleared. How can Medi AI assist you with your health questions today?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* AI Header */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold flex items-center gap-1.5">
              <span>Medi AI Health Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400">Powered by Gemini 3.8 Flash • Clinical Triage</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory Clinical Disclaimer Banner */}
      <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-300 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span className="truncate">AI provides triage guidance, not clinical prescription. In emergency, call 112 / 108.</span>
        </div>
        {onOpenEmergency && (
          <button
            onClick={onOpenEmergency}
            className="text-rose-600 dark:text-rose-400 font-bold hover:underline shrink-0 ml-2"
          >
            Emergency SOS
          </button>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-3xl p-3.5 shadow-sm space-y-2 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs'
                  : msg.isEmergencyAlert
                  ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 rounded-bl-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
              }`}
            >
              {/* Emergency Alert Tag */}
              {msg.isEmergencyAlert && (
                <div className="p-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center justify-between gap-2 shadow-sm animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>EMERGENCY WARNING DETECTED</span>
                  </div>
                  {onOpenEmergency && (
                    <button
                      onClick={onOpenEmergency}
                      className="px-2 py-0.5 rounded-lg bg-white text-rose-700 font-extrabold text-[10px] hover:bg-rose-50"
                    >
                      Call 112 / 108
                    </button>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap font-sans text-xs">
                {msg.text}
              </div>

              {/* Action Chip: Doctor / Specialty Recommendation */}
              {msg.suggestedSpecialty && onNavigateToSpecialty && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                    Recommended Clinical Next Step:
                  </span>
                  <button
                    onClick={() => onNavigateToSpecialty(msg.suggestedSpecialty!)}
                    className="w-full p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-between hover:bg-teal-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Find {msg.suggestedSpecialty} Specialists</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span
                className={`block text-[9px] text-right ${
                  msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xs shadow-sm">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Medi AI is analyzing symptoms & checking doctors...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-1.5 bg-white/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-500" />
          <span>Try:</span>
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap hover:border-teal-400 hover:text-teal-600 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type symptoms (e.g. sharp chest pain, headache, sore throat)..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0 shadow-md shadow-teal-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
