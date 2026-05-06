import { useState } from 'react';
import { connectDB, type ConnectPayload } from '../api/client';

interface Props {
  onConnected: (sessionId: string, tableCount: number) => void;
}

type Dialect = 'postgresql' | 'mysql' | 'sqlite';

export default function ConnectionForm({ onConnected }: Props) {
  const [dialect, setDialect] = useState<Dialect>('postgresql');
  const [form, setForm] = useState({
    host: 'localhost', port: '5432', database: '', user: '', password: '', file_path: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: ConnectPayload = dialect === 'sqlite'
        ? { dialect, file_path: form.file_path }
        : { dialect, host: form.host, port: Number(form.port), database: form.database, user: form.user, password: form.password };

      const data = await connectDB(payload);
      onConnected(data.session_id, data.schema.tables.length);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-4">
      {/* Dialect tabs */}
      <div className="flex gap-2">
        {(['postgresql', 'mysql', 'sqlite'] as Dialect[]).map(d => (
          <button key={d} onClick={() => setDialect(d)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              dialect === d
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* Form fields */}
      {dialect === 'sqlite' ? (
        <input className={inp} placeholder="Path to .db file (e.g. /data/mydb.db)"
          value={form.file_path} onChange={e => setForm(p => ({ ...p, file_path: e.target.value }))} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="Host" value={form.host}
            onChange={e => setForm(p => ({ ...p, host: e.target.value }))} />
          <input className={inp} placeholder="Port" value={form.port}
            onChange={e => setForm(p => ({ ...p, port: e.target.value }))} />
          <input className={`${inp} col-span-2`} placeholder="Database name" value={form.database}
            onChange={e => setForm(p => ({ ...p, database: e.target.value }))} />
          <input className={inp} placeholder="Username" value={form.user}
            onChange={e => setForm(p => ({ ...p, user: e.target.value }))} />
          <input className={inp} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button onClick={handleConnect} disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
        {loading ? 'Connecting…' : 'Connect to Database'}
      </button>
    </div>
  );
}