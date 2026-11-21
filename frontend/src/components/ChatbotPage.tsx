import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  X,
  User,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { TWELVE_MEDICAL_DOMAINS } from '../data/medicalDomains';
import { ExecutionGraph, ExecutionStage } from './ExecutionGraph';

export interface ConversationItem {
  id: string;
  user_id: string;
  title: string;
  primary_domain: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  domain?: string;
  isSafe?: boolean;
  safetyNote?: string;
}

interface ChatbotPageProps {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  copiedId: string | null;
  currentRoutedDomain: string | null;
  executionStages?: ExecutionStage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  sampleStarters: { title: string; domainBadge: string; prompt: string }[];
  onInput: (v: string) => void;
  onSend: (prompt?: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCopy: (id: string, text: string) => void;
  onClear: () => void;
  onSelectAgent: (domain: any) => void;
  
  // Multi-chat props
  conversations: ConversationItem[];
  activeConversationId: string | null;
  userId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onChangeUser: (newUserId: string) => void;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
  messages,
  input,
  isLoading,
  copiedId,
  currentRoutedDomain,
  executionStages,
  messagesEndRef,
  textareaRef,
  sampleStarters,
  onInput,
  onSend,
  onKeyDown,
  onCopy,
  onClear,
  onSelectAgent,
  conversations,
  activeConversationId,
  userId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onChangeUser,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempUserId, setTempUserId] = useState(userId);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="w-full min-h-screen pt-20 pb-10 px-3 sm:px-6 flex flex-col items-center bg-[#f3f7f4] dark:bg-[#000000] text-zinc-900 dark:text-white relative transition-colors duration-200">
      {/* Background Gradients */}
      <div className="absolute inset-0 canvas-dot-grid pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[350px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.09),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />

      {/* Main Multi-Pane Window (Sidebar + Chat Console + Right Execution Panel) */}
      <div className="relative z-10 w-full max-w-7xl rounded-2xl border border-emerald-900/15 dark:border-emerald-500/20 bg-white/95 dark:bg-[#0c120e]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-row" style={{ height: 'calc(100vh - 120px)', minHeight: 650 }}>
        
        {/* ================= LEFT SIDEBAR (ChatGPT Style) ================= */}
        <aside
          className={`${
            sidebarOpen ? 'w-72 sm:w-80' : 'w-0'
          } flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out border-r border-emerald-900/10 dark:border-white/[0.08] bg-[#f8faf8] dark:bg-[#0a0f0c] overflow-hidden`}
        >
          {/* Sidebar Top: New Chat Button */}
          <div className="p-3.5 border-b border-emerald-900/10 dark:border-white/[0.08] flex items-center gap-2">
            <button
              onClick={onNewConversation}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Consultation</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversations History List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
            <div className="px-2 py-1.5 text-[10px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500 font-semibold">
              Recent Consultations ({conversations.length})
            </div>

            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                No past consultations yet. Start one above!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-500/25 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      <span className="truncate">{conv.title || 'Untitled Consultation'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      title="Delete consultation"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer: User Switcher / Profile */}
          <div className="p-3 border-t border-emerald-900/10 dark:border-white/[0.08] bg-emerald-50/40 dark:bg-black/20">
            {isEditingUser ? (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-400">Switch Patient ID:</div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tempUserId}
                    onChange={(e) => setTempUserId(e.target.value)}
                    className="flex-1 bg-white dark:bg-black/40 border border-emerald-900/20 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                    placeholder="e.g. user_123"
                  />
                  <button
                    onClick={() => {
                      if (tempUserId.trim()) {
                        onChangeUser(tempUserId.trim());
                        setIsEditingUser(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{userId}</div>
                    <div className="text-[10px] text-zinc-400">Active Patient Profile</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingUser(true)}
                  className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ================= RIGHT MAIN CHAT AREA ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Header Strip */}
          <div className="h-14 px-4 sm:px-6 border-b border-emerald-900/10 dark:border-white/[0.08] flex items-center justify-between bg-emerald-50/70 dark:bg-[#121914] text-xs flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-emerald-100/50 dark:hover:bg-white/5 transition-colors"
                title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>

              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] flex-shrink-0" />
              <div className="truncate font-semibold text-zinc-800 dark:text-zinc-100 text-sm">
                {activeConv ? activeConv.title : 'Clinical Stream'}
              </div>
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">•</span>
              <span className="hidden sm:inline font-mono text-zinc-500 dark:text-zinc-400 text-xs">
                {currentRoutedDomain ? currentRoutedDomain.toUpperCase() : '12-DOMAIN ORCHESTRATION'}
              </span>
            </div>

            <button
              onClick={onClear}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1.5 transition-colors text-xs font-mono px-2.5 py-1 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-white/5 flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear View</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const domainDef = TWELVE_MEDICAL_DOMAINS.find(d => d.domain === msg.domain);
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-400 shadow-sm">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[78%]`}>
                    {/* Domain badge */}
                    {!isUser && msg.domain && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <button
                          onClick={() => domainDef && onSelectAgent(domainDef)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                          <Compass className="w-2.5 h-2.5" />
                          <span>{domainDef ? domainDef.name : msg.domain}</span>
                        </button>
                        {msg.isSafe === false && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-500 border border-red-500/20">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>RED FLAG</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`relative group rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-zinc-100 dark:bg-[#141d17] border border-emerald-900/10 dark:border-emerald-500/20 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                      }`}
                    >
                      <div className="prose dark:prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:my-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Message Actions */}
                      <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] text-zinc-400 font-mono">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => onCopy(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 hover:text-zinc-600 dark:hover:text-zinc-200 transition-opacity p-0.5"
                          title="Copy content"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold shadow-sm">
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <Activity className="w-4 h-4 animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-[#141d17] border border-emerald-900/10 dark:border-emerald-500/20 text-xs text-zinc-500 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                  <span>Synthesizing clinical evidence across pipeline...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 sm:px-6 py-2 border-t border-emerald-900/10 dark:border-white/[0.08] bg-emerald-50/30 dark:bg-black/20 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Suggestions:
            </span>
            {sampleStarters.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSend(item.prompt)}
                className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5"
              >
                <span>{item.title}</span>
                <ArrowRight className="w-2.5 h-2.5 text-emerald-500" />
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-emerald-900/10 dark:border-white/[0.08] bg-white dark:bg-[#0c120e]">
            <div className="relative flex items-center rounded-xl bg-zinc-100 dark:bg-[#141d17] border border-emerald-900/15 dark:border-emerald-500/20 focus-within:border-emerald-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => onInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Describe your health question or symptoms..."
                rows={1}
                className="w-full px-4 py-3.5 bg-transparent resize-none outline-none text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
              <button
                onClick={() => onSend()}
                disabled={isLoading || !input.trim()}
                className="mr-2 p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-all flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5 px-1 font-mono">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-emerald-500" /> AI guidance only — consult a licensed medical provider.
              </span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </main>

        {/* ================= RIGHT SSE EXECUTION SIDEBAR ================= */}
        {executionStages && executionStages.length > 0 && (
          <aside className="w-64 lg:w-72 flex-shrink-0 border-l border-emerald-900/10 dark:border-white/[0.08] bg-[#f8faf8]/70 dark:bg-[#0a0f0c]/90 hidden md:flex flex-col">
            <ExecutionGraph
              stages={executionStages}
              activeDomain={currentRoutedDomain}
              layout="vertical"
            />
          </aside>
        )}
      </div>
    </div>
  );
};
