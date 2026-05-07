import type { ChatMessage } from '../api/client';

interface Props { message: ChatMessage; }

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lang  = part.match(/```(\w*)/)?.[1] || '';
      const code  = part.replace(/```\w*\n?/, '').replace(/\n?```$/, '');
      return (
        <div key={i} className="mt-3 mb-1 rounded-lg overflow-hidden border border-white/8">
          {lang && (
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface-900 border-b border-white/8">
              <span className="text-xs font-mono text-white/35 uppercase tracking-wider">{lang}</span>
              <button
                className="text-xs text-white/25 hover:text-white/60 transition-colors"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                copy
              </button>
            </div>
          )}
          <pre className="bg-surface-950 text-jade text-xs font-mono px-3.5 py-3 overflow-x-auto leading-relaxed">
            {code}
          </pre>
        </div>
      );
    }
    // Render plain text with paragraph breaks
    return (
      <span key={i} className="whitespace-pre-wrap leading-relaxed">
        {part}
      </span>
    );
  });
}

function Timestamp({ date }: { date: Date }) {
  return (
    <span className="text-xs text-white/20">
      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="msg-enter flex justify-end mb-4">
        <div className="max-w-[78%]">
          <div className="bg-accent/20 border border-accent/25 rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-sm text-white/90 leading-relaxed">{message.content}</p>
          </div>
          <div className="flex justify-end mt-1 pr-1">
            <Timestamp date={message.timestamp} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-enter flex justify-start mb-4">
      <div className="max-w-[85%]">
        {/* Avatar + header */}
        <div className="flex items-center gap-2 mb-1.5 ml-1">
          <div className="w-5 h-5 rounded-full bg-jade/20 border border-jade/30 flex items-center justify-center">
            <span className="text-jade text-[9px] font-bold">Q</span>
          </div>
          <span className="text-xs font-medium text-white/40">QueryMind</span>
          <Timestamp date={message.timestamp} />
        </div>

        <div className="bg-surface-700 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="text-sm text-white/85">{renderContent(message.content)}</div>

          {/* SQL metadata badge */}
          {message.row_count != null && (
            <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/8">
              <span className="w-1.5 h-1.5 rounded-full bg-jade inline-block" />
              <span className="text-xs text-white/35 font-mono">{message.row_count} rows returned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}