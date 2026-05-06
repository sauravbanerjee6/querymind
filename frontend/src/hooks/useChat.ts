import { useState, useCallback } from 'react';
import { type ChatMessage, sendChat } from '../api/client';

export function useChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    if (!sessionId) return;

    // Optimistically add the user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const data = await sendChat(sessionId, text);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        executed_sql: data.executed_sql,
        row_count: data.row_count,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, loading, error, send, clear };
}