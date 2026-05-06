import { useState } from 'react';
import ConnectionForm from './components/ConnectionForm';
import ChatWindow from './components/ChatWindow';
import { disconnectDB } from './api/client';

export default function App() {
  const [session, setSession] = useState<{ id: string; summary: string } | null>(null);

  const handleConnected = (sessionId: string, tableCount: number) => {
    setSession({ id: sessionId, summary: `Connected · ${tableCount} tables found` });
  };

  const handleDisconnect = async () => {
    if (session) {
      await disconnectDB(session.id);
      setSession(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">DataLens</span>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">RAG for databases</span>
        </div>
        {session && (
          <button onClick={handleDisconnect}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            Disconnect
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        {!session ? (
          // Connection screen — centered card
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h1 className="text-xl font-semibold mb-1">Connect to a database</h1>
              <p className="text-sm text-gray-500 mb-6">DataLens will analyze your schema and let you ask questions in plain English.</p>
              <ConnectionForm onConnected={handleConnected} />
            </div>
          </div>
        ) : (
          // Chat screen — full height
          <div className="flex-1 overflow-hidden">
            <ChatWindow sessionId={session.id} tableSummary={session.summary} />
          </div>
        )}
      </main>
    </div>
  );
}