import React, { useState, useEffect } from 'react';
import { Key, Server, Cpu, Check, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

export interface ModelConfig {
  provider: 'ollama' | 'openai' | 'groq' | 'openrouter';
  model: string;
  apiKey: string;
  apiBase: string;
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSave: (config: ModelConfig) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [provider, setProvider] = useState<ModelConfig['provider']>(config.provider || 'ollama');
  const [model, setModel] = useState(config.model || 'qwen2.5:3b');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [apiBase, setApiBase] = useState(config.apiBase || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProvider(config.provider);
    setModel(config.model);
    setApiKey(config.apiKey);
    setApiBase(config.apiBase);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleProviderSelect = (p: ModelConfig['provider']) => {
    setProvider(p);
    if (p === 'ollama') {
      setModel('qwen2.5:3b');
      setApiBase('http://localhost:11434');
    } else if (p === 'openai') {
      setModel('gpt-4o-mini');
      setApiBase('https://api.openai.com/v1');
    } else if (p === 'groq') {
      setModel('llama-3.3-70b-versatile');
      setApiBase('https://api.groq.com/openai/v1');
    } else if (p === 'openrouter') {
      setModel('deepseek/deepseek-chat');
      setApiBase('https://openrouter.ai/api/v1');
    }
  };

  const handleSave = () => {
    onSave({
      provider,
      model,
      apiKey,
      apiBase
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-msg">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                Model & Provider Configuration
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                BYOK (Bring Your Own Key) or Local Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-mono px-2 py-1 rounded"
          >
            ESC ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 font-sans text-xs">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              Inference Engine / Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['ollama', 'openai', 'groq', 'openrouter'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderSelect(p)}
                  className={`px-3 py-2 rounded-xl border text-center font-mono capitalize transition-all ${
                    provider === p
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
              Model Identifier
            </label>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2">
              <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. qwen2.5:3b, gpt-4o, llama-3.3-70b-versatile"
                className="w-full bg-transparent outline-none font-mono text-slate-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {/* API Key (if not local ollama) */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
              {provider === 'ollama' ? 'API Key (Optional for Ollama)' : `${provider.toUpperCase()} API Key`}
            </label>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2">
              <Key className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'ollama' ? 'Not required for local Ollama' : 'sk-...'}
                className="w-full bg-transparent outline-none font-mono text-slate-900 dark:text-zinc-100 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
              Keys are kept in client session storage and sent securely only to orchestrate this session.
            </p>
          </div>

          {/* Endpoint URL Base */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
              Custom Endpoint Base (Optional)
            </label>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2">
              <Server className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="e.g. http://localhost:11434 or https://api.openai.com/v1"
                className="w-full bg-transparent outline-none font-mono text-slate-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Deterministic Safety Gate Always Active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Apply Model
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
