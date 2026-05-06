import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface ConnectPayload {
  dialect: 'postgresql' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  file_path?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  executed_sql?: string | null;
  row_count?: number | null;
  timestamp: Date;
}

export const connectDB = (payload: ConnectPayload) =>
  api.post('/connect', payload).then(r => r.data);

export const disconnectDB = (sessionId: string) =>
  api.delete(`/connect/${sessionId}`).then(r => r.data);

export const sendChat = (sessionId: string, message: string) =>
  api.post('/chat', { session_id: sessionId, message }).then(r => r.data);