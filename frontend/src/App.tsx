import React, { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  Stethoscope,
} from 'lucide-react';
import { UnifiedLandingView } from './components/UnifiedLandingView';
import { AgentDetailModal } from './components/AgentDetailModal';
import { DocsSection } from './components/DocsSection';
import { VerticalArchitecturePage } from './components/VerticalArchitecturePage';
import { ChatbotPage, ConversationItem, ChatMessage } from './components/ChatbotPage';
import { TWELVE_MEDICAL_DOMAINS, MedicalDomainAgent } from './data/medicalDomains';

const SAMPLE_CASE_STARTERS = [
  {
    title: "Tension headache",
    domainBadge: "General Medicine",
    prompt: "I have had a mild, dull headache behind my eyes and temples for the past 2 days. What could cause this?",
  },
  {
    title: "Iron absorption",
    domainBadge: "Nutrition",
    prompt: "What are the best dietary sources of non-heme iron and how should I pair them for maximum absorption?",
  },
  {
    title: "Annular skin rash",
    domainBadge: "Dermatology",
    prompt: "I noticed a red, annular itchy ring on my forearm after gardening. What non-urgent measures are safe?",
  },
  {
    title: "Chest pain emergency",
    domainBadge: "Safety Gate",
    prompt: "I have sudden severe crushing chest pain spreading to my left jaw, shortness of breath, and feeling dizzy.",
  }
];

const DEFAULT_WELCOME_MSG: ChatMessage = {
  id: 'welcome-01',
  sender: 'assistant',
  content: "MediOrchestrator online. Your inquiry will be routed through 12 clinical domain agents, verified by dual safety guardrails, and grounded with multi-turn patient memory.\n\nDescribe your symptoms or health question below.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  domain: 'general_medicine',
  isSafe: true,
};

type TabId = 'platform' | 'chatbot' | 'architecture' | 'docs';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('platform');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Multi-User and Multi-Conversation state
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('mediorchestrator_user_id') || 'patient_01';
  });
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<MedicalDomainAgent | null>(null);
  const [currentRoutedDomain, setCurrentRoutedDomain] = useState<string | null>('general_medicine');
  const [lastQuery, setLastQuery] = useState<string>('');
  const [lastIsSafe, setLastIsSafe] = useState<boolean>(true);
  const [lastExecutionTrace, setLastExecutionTrace] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/health');
        setSystemOnline(res.ok);
      } catch { setSystemOnline(false); }
    };
    check();
    const iv = setInterval(check, 25000);
    return () => clearInterval(iv);
  }, []);

  // Fetch conversations when user changes
  useEffect(() => {
    localStorage.setItem('mediorchestrator_user_id', userId);
    fetchConversations();
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/conversations?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.warn("Failed to fetch conversations", e);
    }
  };

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([DEFAULT_WELCOME_MSG]);
      return;
    }

    const loadMessages = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/conversations/${activeConversationId}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped: ChatMessage[] = data.map((m: any) => ({
              id: m.id,
              sender: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              domain: m.domain,
              isSafe: m.is_safe,
              safetyNote: m.safety_note
            }));
            setMessages(mapped);
          } else {
            setMessages([DEFAULT_WELCOME_MSG]);
          }
        }
      } catch (err) {
        console.error("Failed to load thread messages", err);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([DEFAULT_WELCOME_MSG]);
    setCurrentRoutedDomain('general_medicine');
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/conversations/${convId}?user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewConversation();
      }
    } catch (e) {
      console.error("Failed to delete conversation", e);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const queryToSend = (customPrompt || input).trim();
    if (!queryToSend || isLoading) return;

    setLastQuery(queryToSend);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToSend,
          user_id: userId,
          conversation_id: activeConversationId
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: HTTP ${response.status}`);
      }

      const data = await response.json();
      setCurrentRoutedDomain(data.domain);
      setLastIsSafe(data.is_safe ?? true);
      setLastExecutionTrace(data.execution_trace || null);

      if (data.conversation_id && data.conversation_id !== activeConversationId) {
        setActiveConversationId(data.conversation_id);
      }
      fetchConversations();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: data.response,
        domain: data.domain,
        isSafe: data.is_safe ?? true,
        safetyNote: data.safety_note,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: `Pipeline Exception: ${err.message || 'Could not connect to the backend.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSafe: false,
        safetyNote: "Service Communication Error"
      };
      setMessages(prev => [...prev, errorMessage]);
      setLastIsSafe(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f4] dark:bg-[#000000] text-zinc-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-emerald-900/10 dark:border-white/[0.08] bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            MediOrchestrator
          </span>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-black/5 dark:border-white/5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('platform')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'platform' ? 'bg-white dark:bg-emerald-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'chatbot' ? 'bg-white dark:bg-emerald-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Chatbot
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'architecture' ? 'bg-white dark:bg-emerald-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'docs' ? 'bg-white dark:bg-emerald-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Docs
          </button>
        </div>

        {/* Right Status & Dark Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
            <div className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-zinc-600 dark:text-zinc-300">
              {systemOnline ? 'ONLINE // 8000' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg border border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Main View Router */}
      {activeTab === 'platform' && (
        <UnifiedLandingView
          onScrollToChat={() => setActiveTab('chatbot')}
          onGoToChatbot={() => setActiveTab('chatbot')}
          onGoToArchitecture={() => setActiveTab('architecture')}
        />
      )}

      {activeTab === 'chatbot' && (
        <ChatbotPage
          messages={messages}
          input={input}
          isLoading={isLoading}
          copiedId={copiedId}
          currentRoutedDomain={currentRoutedDomain}
          messagesEndRef={messagesEndRef}
          textareaRef={textareaRef}
          sampleStarters={SAMPLE_CASE_STARTERS}
          onInput={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          onCopy={handleCopy}
          onClear={() => setMessages([DEFAULT_WELCOME_MSG])}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          // Multi-chat props
          conversations={conversations}
          activeConversationId={activeConversationId}
          userId={userId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onChangeUser={(newId) => setUserId(newId)}
        />
      )}

      {activeTab === 'architecture' && (
        <VerticalArchitecturePage
          lastQuery={lastQuery}
          currentRoutedDomain={currentRoutedDomain}
          isSafe={lastIsSafe}
          executionTrace={lastExecutionTrace}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
        />
      )}

      {activeTab === 'docs' && <DocsSection />}

      {/* Domain Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onSelectPrompt={(p: string) => {
            setSelectedAgent(null);
            setActiveTab('chatbot');
            handleSend(p);
          }}
        />
      )}
    </div>
  );
}
