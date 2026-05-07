import { useState } from 'react';
import { connectDB, type ConnectPayload } from '../api/client';

type Dialect = 'postgresql' | 'mysql' | 'sqlite';

interface Props {
  onConnected: (sessionId: string, tableCount: number, tables: any[], dialect: string) => void;
}
const DIALECT_ICONS: Record<Dialect, string> = {
  postgresql: '🐘',
  mysql:      '🐬',
  sqlite:     '📦',
};

export default function ConnectionForm({ onConnected }: Props) {
  const [dialect,  setDialect]  = useState<Dialect>('postgresql');
  const [form, setForm] = useState({ host: 'localhost', port: '5432', database: '', user: '', password: '', file_path: '' });
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: ConnectPayload = dialect === 'sqlite'
        ? { dialect, file_path: form.file_path }
        : { dialect, host: form.host, port: Number(form.port), database: form.database, user: form.user, password: form.password };
      const data = await connectDB(payload);
      onConnected(data.session_id, data.schema.tables.length, data.schema.tables, data.schema.dialect);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `
    w-full bg-surface-700 border border-white/10 rounded-lg px-3.5 py-2.5
    text-sm text-white placeholder:text-white/25 font-mono
    focus:outline-none focus:border-accent/60 focus:bg-surface-600
    transition-all duration-150
  `;

  return (
    <div className="space-y-6">
      {/* Dialect selector */}
      <div>
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Database Engine</p>
        <div className="grid grid-cols-3 gap-2">
          {(['postgresql', 'mysql', 'sqlite'] as Dialect[]).map(d => (
            <button
              key={d}
              onClick={() => { setDialect(d); setError(null); }}
              className={`
                flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium
                transition-all duration-150
                ${dialect === d
                  ? 'border-accent/60 bg-accent/10 text-accent shadow-glow-accent'
                  : 'border-white/8 bg-surface-700 text-white/40 hover:border-white/20 hover:text-white/70'
                }
              `}
            >
              <span className="text-xl">{DIALECT_ICONS[d]}</span>
              <span className="capitalize">{d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {dialect === 'sqlite' ? (
          <div>
            <label className="block text-xs text-white/40 mb-1.5 ml-0.5">File Path</label>
            <input
              className={inputCls}
              placeholder="/absolute/path/to/database.db"
              value={form.file_path}
              onChange={set('file_path')}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs text-white/40 mb-1.5 ml-0.5">Host</label>
                <input className={inputCls} placeholder="localhost" value={form.host} onChange={set('host')} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 ml-0.5">Port</label>
                <input className={inputCls} placeholder="5432" value={form.port} onChange={set('port')} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 ml-0.5">Database</label>
              <input className={inputCls} placeholder="my_database" value={form.database} onChange={set('database')} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 ml-0.5">User</label>
                <input className={inputCls} placeholder="postgres" value={form.user} onChange={set('user')} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 ml-0.5">Password</label>
                <input className={inputCls} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-lg px-3.5 py-2.5">
          <span className="text-red-400 text-sm mt-0.5">⚠</span>
          <p className="text-red-400 text-sm leading-snug">{error}</p>
        </div>
      )}

      {/* Connect button */}
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`
          w-full py-3 rounded-xl text-sm font-semibold tracking-wide
          transition-all duration-200
          ${loading
            ? 'bg-accent/40 text-white/40 cursor-not-allowed'
            : 'bg-accent hover:bg-accent-dim text-white shadow-glow-accent hover:shadow-none active:scale-[0.98]'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Connecting…
          </span>
        ) : 'Connect →'}
      </button>
    </div>
  );
}