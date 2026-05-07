import { useState } from 'react';
import ConnectionForm from './components/ConnectionForm';
import ChatWindow from './components/ChatWindow';
import SchemaPanel from './components/SchemaPanel';
import { disconnectDB, type TableInfo } from './api/client';

interface Session {
  id: string;
  tables: TableInfo[];
  dialect: string;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleConnected = (sessionId: string, tableCount: number, tables: TableInfo[], dialect: string) => {
    setSession({ id: sessionId, tables, dialect });
  };

  const handleDisconnect = async () => {
    if (!session) return;
    await disconnectDB(session.id).catch(() => { });
    setSession(null);
  };

  return (
    <div className="h-screen flex flex-col text-white font-sans overflow-hidden" style={{ background: '#0a0a0f' }}>

      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 bg-surface-900 border-b border-white/6">
        <div className="flex items-center gap-3">
          {session && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/6 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-jade/15 border border-jade/25 flex items-center justify-center">
              <span className="text-jade text-xs font-bold">Q</span>
            </div>
            <span className="text-sm font-semibold text-white">QueryMind</span>
            <span className="text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">beta</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
                <span className="text-xs text-white/40 font-mono">{session.dialect}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-xs text-white/30 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/8 hover:border-red-500/30 transition-all duration-150"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {!session ? (
          /* ── Connect screen ── */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              {/* Brand */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-jade/10 border border-accent/20 flex items-center justify-center mx-auto mb-5 shadow-glow-accent">
                  <span className="text-3xl">🔍</span>
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">Connect your data</h1>
                <p className="text-sm text-white/40 leading-relaxed">
                  QueryMind analyzes your database schema and lets you ask questions in plain English, powered by Gemini.
                </p>
              </div>

              {/* Form card */}
              <div className="bg-surface-800 border border-white/8 rounded-2xl p-6 shadow-card">
                <ConnectionForm
                  onConnected={(sid, count, tables, dialect) =>
                    handleConnected(sid, count, tables, dialect)
                  }
                />
              </div>

              <p className="text-center text-xs text-white/20 mt-5">
                Read-only access · Queries are never stored
              </p>
            </div>
          </div>

        ) : (
          /* ── Chat layout ── */
          <>
            {/* Schema sidebar */}
            <aside
              className={`
                sidebar-texture shrink-0 flex flex-col bg-surface-900 border-r border-white/6
                transition-all duration-200 overflow-hidden
                ${sidebarOpen ? 'w-60' : 'w-0'}
              `}
            >
              <SchemaPanel tables={session.tables} dialect={session.dialect} />
            </aside>

            {/* Chat area */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <ChatWindow sessionId={session.id} tableCount={session.tables.length} />
            </main>
          </>
        )}
      </div>
    </div>
  );
}