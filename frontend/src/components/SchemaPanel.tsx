import { useState } from 'react';
import type { TableInfo } from '../api/client';

interface Props {
  tables: TableInfo[];
  dialect: string;
}

export default function SchemaPanel({ tables, dialect }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalRows = tables.reduce((s, t) => s + (t.row_count || 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header stats */}
      <div className="px-4 pt-4 pb-3 border-b border-white/6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">Schema</span>
          <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-mono">{dialect}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-700 rounded-lg px-3 py-2">
            <p className="text-xs text-white/35 mb-0.5">Tables</p>
            <p className="text-lg font-semibold text-white font-mono">{tables.length}</p>
          </div>
          <div className="bg-surface-700 rounded-lg px-3 py-2">
            <p className="text-xs text-white/35 mb-0.5">Total rows</p>
            <p className="text-lg font-semibold text-white font-mono">{totalRows.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto py-2">
        {tables.map(table => (
          <div key={table.table_name}>
            <button
              onClick={() => setExpanded(expanded === table.table_name ? null : table.table_name)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/4 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-white/25 text-xs group-hover:text-accent/70 transition-colors">▸</span>
                <span className="text-sm text-white/80 font-mono truncate">{table.table_name}</span>
              </div>
              <span className="text-xs text-white/25 font-mono ml-2 shrink-0">
                {(table.row_count || 0).toLocaleString()}
              </span>
            </button>

            {expanded === table.table_name && (
              <div className="mx-3 mb-2 bg-surface-900 rounded-lg border border-white/6 overflow-hidden">
                {table.columns.map((col, i) => (
                  <div
                    key={col.column_name}
                    className={`flex items-center justify-between px-3 py-1.5 ${i > 0 ? 'border-t border-white/5' : ''}`}
                  >
                    <span className="text-xs text-white/70 font-mono">{col.column_name}</span>
                    <span className="text-xs text-jade/70 font-mono ml-2">{col.data_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}