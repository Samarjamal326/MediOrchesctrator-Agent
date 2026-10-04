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
import { ChatbotPage } from './components/ChatbotPage';
import { TWELVE_MEDICAL_DOMAINS, MedicalDomainAgent } from './data/medicalDomains';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  domain?: string;
  isSafe?: boolean;
  safetyNote?: string;
}

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

type TabId = 'platform' | 'chatbot' | 'architecture' | 'docs';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('platform');
  const [isDark, setIsDark] = useState<boolean>(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      content: "MediOrchestrator online. Your inquiry will be routed through 12 clinical domain agents, verified by dual safety guardrails, and grounded with RAG knowledge retrieval.\n\nDescribe your symptoms or health question below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      domain: 'general_medicine',
      isSafe: true,
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<MedicalDomainAgent | null>(null);
  const [currentRoutedDomain, setCurrentRoutedDomain] = useState<string | null>('general_medicine');
  const [lastQuery, setLastQuery] = useState<string>('');
  const [lastIsSafe, setLastIsSafe] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const queryToSend = (customPrompt || input).trim();
    if (!queryToSend || isLoading) return;

    setLastQuery(queryToSend);

    const userMessage: Message = {
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
        body: JSON.stringify({ query: queryToSend }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: HTTP ${response.status}`);
      }

      const data = await response.json();
      setCurrentRoutedDomain(data.domain);
      setLastIsSafe(data.is_safe ?? true);

      const assistantMessage: Message = {
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
      const errorMessage: Message = {
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

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      sender: 'assistant',
      content: "Session cleared. Ready for your next clinical inquiry.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      domain: 'general_medicine',
      isSafe: true
    }]);
    setCurrentRoutedDomain('general_medicine');
    setLastQuery('');
  };

  const NAV_TABS: { id: TabId; label: string }[] = [
    { id: 'platform', label: 'Home' },
    { id: 'chatbot', label: 'Chatbot' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'docs', label: 'Docs' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-blue-500/30 selection:text-white relative">

      {/* ======= FLOATING NAVBAR ======= */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[95%] max-w-7xl">

        {/* Brand */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('platform'); }}
          className="flex items-center gap-2.5 text-white text-xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-black">
            <Stethoscope className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>MediOrchestrator</span>
        </a>

        {/* Center Nav Pill */}
        <div className="hidden md:flex items-center bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${activeTab === tab.id ? 'text-black bg-white' : 'text-zinc-300 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-zinc-900/70 border border-white/10 px-3 py-1.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-zinc-300">{systemOnline ? 'ONLINE // 8000' : 'BACKEND IDLE'}</span>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-zinc-900/60 border border-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* ======= PLATFORM (Landing) ======= */}
      {activeTab === 'platform' && (
        <UnifiedLandingView
          onScrollToChat={() => setActiveTab('chatbot')}
          onGoToChatbot={() => setActiveTab('chatbot')}
          onGoToArchitecture={() => setActiveTab('architecture')}
        />
      )}

      {/* ======= CHATBOT PAGE ======= */}
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
          onClear={clearChat}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
        />
      )}

      {/* ======= ARCHITECTURE PAGE ======= */}
      {activeTab === 'architecture' && (
        <VerticalArchitecturePage
          currentRoutedDomain={currentRoutedDomain}
          lastQuery={lastQuery}
          isSafe={lastIsSafe}
          isProcessing={isLoading}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
        />
      )}

      {/* ======= DOCS ======= */}
      {activeTab === 'docs' && (
        <main className="w-full pt-28 pb-16 px-4">
          <DocsSection />
        </main>
      )}

      {/* ======= AGENT DETAIL MODAL ======= */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          isCurrentlyRouted={currentRoutedDomain === selectedAgent.domain}
          onSelectPrompt={(p) => {
            handleSend(p);
            setActiveTab('chatbot');
          }}
        />
      )}

    </div>
  );
}
