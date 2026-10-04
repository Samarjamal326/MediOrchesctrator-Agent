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
    <div className="w-full min-h-screen pt-24 pb-16 px-4 flex flex-col items-center bg-[#000000] relative">

      {/* Background */}
      <div className="absolute inset-0 canvas-dot-grid pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[350px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.07),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center mb-8 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 text-xs font-mono mb-3">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>INTERACTIVE CLINICAL CONSOLE // 12-DOMAIN PIPELINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Clinical Consultation
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Submit a health query — the system routes it through the architecture pipeline to the right specialist agent.
        </p>
      </div>

      {/* Chat Window */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#09090b]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>

        {/* Header Strip */}
        <div className="h-12 px-5 border-b border-white/[0.06] flex items-center justify-between bg-black/40 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">Clinical Stream</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-400 text-[11px]">12-Domain Dynamic Routing</span>
          </div>
          <button
            onClick={onClear}
            className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors text-[11px] font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const domainDef = TWELVE_MEDICAL_DOMAINS.find(d => d.domain === msg.domain);
            return (
              <div
                key={msg.id}
                className={`animate-msg flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold border ${isUser ? 'bg-white text-black border-white' : 'bg-zinc-800 text-white border-zinc-700'}`}>
                  {isUser ? 'You' : <Stethoscope className="w-4 h-4 text-blue-400" />}
                </div>

                <div className="flex flex-col gap-1 max-w-[85%]">
                  {!isUser && msg.domain && (
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        onClick={() => { if (domainDef) onSelectAgent(domainDef); }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
                      >
                        <HeartPulse className="w-3 h-3" />
                        Routed: {domainDef ? domainDef.name : msg.domain}
                        <span className="text-[10px] text-zinc-500">↗</span>
                      </button>
                      {msg.isSafe === false && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Safety Intercept
                        </span>
                      )}
                      {msg.isSafe === true && msg.domain && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Safety Cleared
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${isUser ? 'bg-white text-black rounded-tr-none font-medium' : 'bg-zinc-900/90 text-zinc-100 border border-white/[0.08] rounded-tl-none'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-mono">{msg.timestamp}</span>
                        <button
                          onClick={() => onCopy(msg.id, msg.content)}
                          className="hover:text-zinc-200 transition-colors flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                          ) : (
                            <Copy className="w-3 h-3" />
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
            <div className="flex gap-3 mr-auto max-w-xl animate-pulse">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 animate-spin text-blue-400" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/[0.08] rounded-tl-none text-xs text-zinc-400 flex items-center gap-2 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Routing through clinical agent pipeline...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Starters */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto text-xs flex-shrink-0">
          <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 flex-shrink-0">
            <Compass className="w-3 h-3 text-blue-400" />
            Try:
          </span>
          {sampleStarters.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs whitespace-nowrap transition-colors"
            >
              <span>{s.title}</span>
              <ArrowRight className="w-3 h-3 text-zinc-500" />
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/60 border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-end gap-2 bg-zinc-900/80 p-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe your symptoms or health question..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-transparent px-3 py-2 text-xs sm:text-sm outline-none text-white placeholder-zinc-500 max-h-32 overflow-y-auto font-sans"
              style={{ height: 'auto', minHeight: '40px' }}
            />
            <button
              onClick={() => onSend()}
              disabled={isLoading || !input.trim()}
              className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-white hover:bg-zinc-200 text-black shadow-sm' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5 px-1">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              AI-assisted guidance only. Not a substitute for emergency medical care.
            </span>
            <span className="hidden sm:inline font-mono text-[10px]">Enter ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
};
