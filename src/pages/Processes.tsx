import { useState, useMemo } from 'react';
import { Search, X, AlertTriangle, Loader2, Activity } from 'lucide-react';
import { useProcesses, useKillProcess } from '../hooks/useSystem';
import { ProcessInfo } from '../types/api';

/** Màu trạng thái process */
function StateChip({ state }: { state: string }) {
  const cls = state === 'running'
    ? 'bg-green-500/15 text-green-400'
    : state === 'sleeping' || state === 'idle'
    ? 'bg-slate-500/15 text-slate-400'
    : 'bg-red-500/15 text-red-400';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{state}</span>;
}

/** Thanh progress nhỏ */
function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-white w-10 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

export function Processes() {
  const { data, isLoading, isError } = useProcesses();
  const { mutateAsync: killProcess, isPending: isKilling } = useKillProcess();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'mem' | 'name'>('cpu');
  const [confirmKill, setConfirmKill] = useState<ProcessInfo | null>(null);

  const filtered = useMemo(() => {
    if (!data?.list) return [];
    return data.list
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || String(p.pid).includes(search))
      .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy]);
  }, [data, search, sortBy]);

  const handleKill = async (p: ProcessInfo) => {
    await killProcess(p.pid);
    setConfirmKill(null);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng processes', value: data?.total ?? '—', icon: Activity, color: 'text-blue-400' },
          { label: 'Đang chạy', value: data?.running ?? '—', icon: Activity, color: 'text-green-400' },
          { label: 'Sleeping', value: data ? (data.total - data.running) : '—', icon: Activity, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-border-subtle rounded-xl px-5 py-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-text-secondary">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc PID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex border border-border-subtle rounded-lg overflow-hidden text-sm">
          {(['cpu', 'mem', 'name'] as const).map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-4 py-2 transition-colors ${sortBy === key ? 'bg-blue-600 text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
            >
              {key === 'cpu' ? 'CPU' : key === 'mem' ? 'RAM' : 'Tên'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-bg-card border border-border-subtle rounded-xl overflow-hidden flex flex-col min-h-0">
        {isError && (
          <div className="p-6 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Không thể tải danh sách processes
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}
        {!isLoading && (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-bg-card border-b border-border-subtle">
                <tr className="text-text-secondary">
                  <th className="px-4 py-3 font-medium">PID</th>
                  <th className="px-4 py-3 font-medium">Tên</th>
                  <th className="px-4 py-3 font-medium w-36">CPU</th>
                  <th className="px-4 py-3 font-medium w-36">RAM</th>
                  <th className="px-4 py-3 font-medium w-20">Trạng thái</th>
                  <th className="px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.pid} className="border-b border-border-subtle/30 hover:bg-white/5 group transition-colors">
                    <td className="px-4 py-2.5 text-text-secondary font-mono">{p.pid}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-white font-medium truncate max-w-[200px] block">{p.name}</span>
                    </td>
                    <td className="px-4 py-2.5"><MiniBar value={p.cpu} color="#3b82f6" /></td>
                    <td className="px-4 py-2.5"><MiniBar value={p.mem} color="#a855f7" /></td>
                    <td className="px-4 py-2.5"><StateChip state={p.state} /></td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setConfirmKill(p)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400/60 hover:text-red-400 transition-all rounded"
                        title="Kill process"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Kill Dialog */}
      {confirmKill && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <h3 className="text-white font-medium">Kill Process?</h3>
            </div>
            <p className="text-text-secondary text-sm mb-6">
              Kết thúc process <span className="text-white font-medium">{confirmKill.name}</span> (PID: {confirmKill.pid})?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmKill(null)} className="px-4 py-2 text-sm text-text-secondary hover:text-white border border-border-subtle rounded-lg">Huỷ</button>
              <button
                onClick={() => handleKill(confirmKill)}
                disabled={isKilling}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {isKilling ? 'Đang kill...' : 'Kill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
