import React from 'react';
import {
  Stethoscope,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Activity,
  HeartPulse,
  RotateCcw,
  Copy,
  Check,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TWELVE_MEDICAL_DOMAINS } from '../data/medicalDomains';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  domain?: string;
  isSafe?: boolean;
  safetyNote?: string;
}

interface ChatbotPageProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  copiedId: string | null;
  currentRoutedDomain: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  sampleStarters: { title: string; domainBadge: string; prompt: string }[];
  onInput: (v: string) => void;
  onSend: (prompt?: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCopy: (id: string, text: string) => void;
  onClear: () => void;
  onSelectAgent: (domain: any) => void;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
  messages, input, isLoading, copiedId, currentRoutedDomain,
  messagesEndRef, textareaRef, sampleStarters,
  onInput, onSend, onKeyDown, onCopy, onClear, onSelectAgent
}) => {
  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 flex flex-col items-center bg-[#f3f7f4] dark:bg-[#000000] text-zinc-900 dark:text-white relative transition-colors duration-200">

      {/* Background */}
      <div className="absolute inset-0 canvas-dot-grid pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[350px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.07),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/10 dark:bg-emerald-950/40 border border-emerald-900/20 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-mono mb-3">
          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>INTERACTIVE CLINICAL CONSOLE // 12-DOMAIN PIPELINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Clinical Consultation
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Submit a health query — the system routes it through the architecture pipeline to the right specialist agent.
        </p>
      </div>

      {/* Chat Window - Expanded size and thematic dark styling */}
      <div className="relative z-10 w-full max-w-4xl rounded-2xl border border-emerald-900/15 dark:border-emerald-500/20 bg-white/95 dark:bg-[#0d1210]/95 backdrop-blur-xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)', minHeight: 620 }}>

        {/* Header Strip */}
        <div className="h-13 px-6 border-b border-emerald-900/10 dark:border-white/[0.08] flex items-center justify-between bg-emerald-50/70 dark:bg-[#141b17] text-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">Clinical Stream</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="font-mono text-zinc-600 dark:text-zinc-400 text-xs">12-Domain Dynamic Routing</span>
          </div>
          <button
            onClick={onClear}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1.5 transition-colors text-xs font-mono px-2.5 py-1 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const domainDef = TWELVE_MEDICAL_DOMAINS.find(d => d.domain === msg.domain);
            return (
              <div
                key={msg.id}
                className={`animate-msg flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold border ${
                  isUser 
                    ? 'bg-emerald-700 text-white border-emerald-800 dark:bg-emerald-600 dark:text-white dark:border-emerald-500 shadow-sm' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-[#1a2420] dark:text-emerald-400 dark:border-emerald-500/30'
                }`}>
                  {isUser ? 'You' : <Stethoscope className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                </div>

                <div className="flex flex-col gap-1.5 max-w-[85%]">
                  {!isUser && msg.domain && (
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        onClick={() => { if (domainDef) onSelectAgent(domainDef); }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-colors shadow-sm"
                      >
                        <HeartPulse className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Routed: {domainDef ? domainDef.name : msg.domain}
                        <span className="text-[10px] text-zinc-500">↗</span>
                      </button>
                      {msg.isSafe === false && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Safety Intercept
                        </span>
                      )}
                      {msg.isSafe === true && msg.domain && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Safety Cleared
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-emerald-700 text-white rounded-tr-none font-medium dark:bg-emerald-700 dark:text-white' 
                      : 'bg-emerald-50/50 text-zinc-900 border border-emerald-900/10 dark:bg-[#151c18] dark:text-zinc-100 dark:border-emerald-500/20 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {!isUser && (
                      <div className="mt-3.5 pt-2.5 border-t border-emerald-900/10 dark:border-white/[0.08] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-mono">{msg.timestamp}</span>
                        <button
                          onClick={() => onCopy(msg.id, msg.content)}
                          className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 mr-auto max-w-xl animate-pulse">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-[#1a2420] flex items-center justify-center">
                <Stethoscope className="w-4 h-4 animate-spin text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/15 dark:bg-[#151c18] dark:border-emerald-500/20 rounded-tl-none text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 flex items-center gap-2 font-mono shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <span>Routing through clinical agent pipeline...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Starters */}
        <div className="px-5 py-3 bg-emerald-50/70 dark:bg-[#111714] border-t border-emerald-900/10 dark:border-white/[0.08] flex items-center gap-2 overflow-x-auto text-xs flex-shrink-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1 flex-shrink-0">
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Try:
          </span>
          {sampleStarters.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-100/60 text-zinc-700 border border-emerald-900/10 dark:bg-[#1c2621] dark:hover:bg-[#23302a] dark:text-zinc-200 dark:border-emerald-500/20 text-xs whitespace-nowrap transition-colors shadow-sm"
            >
              <span>{s.title}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0d1210] border-t border-emerald-900/10 dark:border-white/[0.08] flex-shrink-0">
          <div className="flex items-end gap-2.5 bg-emerald-50/50 dark:bg-[#151c18] p-2.5 rounded-2xl border border-emerald-900/15 dark:border-emerald-500/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-500 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe your symptoms or health question..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 max-h-36 overflow-y-auto font-sans"
              style={{ height: 'auto', minHeight: '44px' }}
            />
            <button
              onClick={() => onSend()}
              disabled={isLoading || !input.trim()}
              className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white shadow-md' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mt-2 px-1">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              AI-assisted guidance only. Not a substitute for emergency medical care.
            </span>
            <span className="hidden sm:inline font-mono text-xs text-zinc-400">Enter ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
};
