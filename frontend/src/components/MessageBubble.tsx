import type { ChatMessage } from '../api/client';

interface Props {
  message: ChatMessage;
}

// Very simple markdown-like renderer: handles ```sql blocks
function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lang = part.match(/```(\w+)/)?.[1] || '';
      const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i} className="mt-2 mb-2 p-3 bg-gray-900 text-green-300 text-xs rounded-lg overflow-x-auto whitespace-pre">
          {lang && <span className="text-gray-500 text-xs uppercase block mb-1">{lang}</span>}
          {code}
        </pre>
      );
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
  });
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser
        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5'
      }`}>
        <div className="text-sm leading-relaxed">{renderContent(message.content)}</div>

        {/* SQL + row count badge for assistant messages */}
        {!isUser && message.row_count !== null && message.row_count !== undefined && (
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {message.row_count} rows returned
          </div>
        )}
      </div>
    </div>
  );
}