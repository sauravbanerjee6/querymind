import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';

interface Props {
  sessionId: string;
  tableCount: number;
}

const SUGGESTIONS = [
  { icon: '📈', label: 'Revenue trend',    prompt: 'Show monthly revenue trend from Jan 2024 to May 2026' },
  { icon: '🏆', label: 'Top customers',    prompt: 'Who are the top 10 customers by lifetime spend?' },
  { icon: '📦', label: 'Category breakdown', prompt: 'Which product category drives the most revenue?' },
  { icon: '🔄', label: 'Refund rate',      prompt: 'What is the refund rate per category?' },
  { icon: '🌍', label: 'Regional sales',   prompt: 'Compare average order value by region' },
  { icon: '🎯', label: 'May campaign',     prompt: 'How did the May 2026 campaign compare to April?' },
];

export default function ChatWindow({ sessionId, tableCount }: Props) {
  const { messages, loading, error, send } = useChat(sessionId);
  const [input, setInput] = useState('');
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    send(text);
    setInput('');
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow textarea up to ~5 lines
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isEmpty ? (
          /* Welcome / suggestions screen */
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-jade/10 border border-jade/20 flex items-center justify-center mb-5 shadow-glow-jade">
              <span className="text-jade text-2xl">⚡</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Ready to analyze</h2>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">
              Connected to {tableCount} tables. Ask anything about your data in plain English.
            </p>
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.prompt}
                  onClick={() => send(s.prompt)}
                  className="flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl border border-white/8 bg-surface-700 hover:bg-surface-600 hover:border-white/15 transition-all duration-150 group"
                >
                  <span className="text-base shrink-0">{s.icon}</span>
                  <span className="text-xs text-white/55 group-hover:text-white/80 transition-colors leading-snug">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}

            {/* Loading indicator */}
            {loading && (
              <div className="msg-enter flex justify-start mb-4">
                <div className="flex items-center gap-2 ml-7">
                  <div className="bg-surface-700 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full dot-1" />
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full dot-2" />
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full dot-3" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-0 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 pb-4">
        <div className="flex items-end gap-2 bg-surface-700 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-accent/40 transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your data…"
            className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-white/25 focus:outline-none leading-relaxed min-h-[20px]"
            style={{ height: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`
              shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
              transition-all duration-150
              ${(!loading && input.trim())
                ? 'bg-accent hover:bg-accent-dim text-white active:scale-95'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-3.5 h-3.5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-white/15 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}