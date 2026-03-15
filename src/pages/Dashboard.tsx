import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Cpu, HardDrive, MemoryStick, Power, Wifi } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useSystemOverview, useRollingHistory } from '../hooks/useSystem';
import { usePm2Apps } from '../hooks/usePm2';

/** Chuyển bytes sang chuỗi dễ đọc (GB, MB, KB) */
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Chuyển giây uptime sang chuỗi d h m */
function formatUptime(seconds: number): string {
  if (!seconds) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}

// Màu sắc cho CPU per core bar chart
const CORE_COLORS = [
  '#3b82f6', '#1e3a8a', '#581c87', '#a855f7', '#7e22ce',
  '#c2410c', '#f97316', '#7c2d12', '#22c55e', '#16a34a',
  '#15803d', '#166534', '#0891b2', '#0284c7', '#7c3aed', '#dc2626',
];

export function Dashboard() {
  const { data: overview, isLoading, isError } = useSystemOverview();
  const { data: pm2Apps } = usePm2Apps();

  // Rolling history cho biểu đồ CPU & Memory
  const cpuHistory = useRollingHistory(overview?.cpu.usage, 60);
  const memHistory = useRollingHistory(overview?.memory.usagePercent, 60);

  // Tính số apps đang chạy từ PM2
  const activeApps = useMemo(() => {
    if (!pm2Apps) return { running: 0, total: 0 };
    const running = pm2Apps.filter(a => a.status === 'online').length;
    return { running, total: pm2Apps.length };
  }, [pm2Apps]);

  // CPU per core data cho BarChart
  const cpuCoresData = useMemo(() => {
    if (!overview?.cpu.cpuPerCore) return [];
    return overview.cpu.cpuPerCore.map((load, i) => ({
      name: `C${i + 1}`,
      value: Math.round(load),
      color: CORE_COLORS[i % CORE_COLORS.length],
    }));
  }, [overview?.cpu.cpuPerCore]);

  const firstDisk = overview?.disk[0];
  const firstNet = overview?.network[0];
  const memPercent = overview?.memory.usagePercent ?? 0;
  const cpuPercent = overview?.cpu.usage ?? 0;
  const diskPercent = firstDisk?.usagePercent ?? 0;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-red-400 text-lg font-medium">Không thể kết nối tới server</p>
          <p className="text-text-secondary text-sm">Kiểm tra server đang chạy trên port 3000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-text-primary">CPU Usage</h3>
            <div className="p-1.5 bg-blue-500/10 rounded-md">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-3xl font-bold text-white">
              {isLoading ? '—' : `${cpuPercent.toFixed(1)}%`}
            </div>
            <div className="text-xs text-text-secondary">
              {overview ? `${overview.cpu.cores} cores` : '—'}
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(cpuPercent, 100)}%` }}
            />
          </div>
        </Card>

        {/* Memory */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-text-primary">Memory</h3>
            <div className="p-1.5 bg-purple-500/10 rounded-md">
              <MemoryStick className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-3xl font-bold text-white">
              {isLoading ? '—' : `${memPercent.toFixed(1)}%`}
            </div>
            <div className="text-xs text-text-secondary">
              {overview
                ? `${formatBytes(overview.memory.used)} / ${formatBytes(overview.memory.total)}`
                : '—'}
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(memPercent, 100)}%` }}
            />
          </div>
        </Card>

        {/* Disk */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-text-primary">Disk Storage</h3>
            <div className="p-1.5 bg-orange-500/10 rounded-md">
              <HardDrive className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-3xl font-bold text-white">
              {isLoading ? '—' : `${diskPercent.toFixed(1)}%`}
            </div>
            <div className="text-xs text-text-secondary">
              {firstDisk
                ? `${formatBytes(firstDisk.used)} / ${formatBytes(firstDisk.size)}`
                : '—'}
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(diskPercent, 100)}%` }}
            />
          </div>
        </Card>

        {/* Active PM2 Apps */}
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-text-primary">Active Apps</h3>
            <div className="p-1.5 bg-green-500/10 rounded-md">
              <Power className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-3xl font-bold text-white">
              {activeApps.running} / {activeApps.total}
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: activeApps.total > 0 ? `${(activeApps.running / activeApps.total) * 100}%` : '0%' }}
            />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="CPU History" action={<span className="text-xs text-text-secondary">Real-time</span>}>
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis hide />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2532', borderColor: '#2a3441', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={((v: number) => [`${v.toFixed(1)}%`, 'CPU']) as never}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Memory History" action={<span className="text-xs text-text-secondary">Real-time</span>}>
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis hide />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2532', borderColor: '#2a3441', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#a855f7' }}
                  formatter={((v: number) => [`${v.toFixed(1)}%`, 'Memory']) as never}
                />
                <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Network + System Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Network Activity">
          <div className="flex justify-between mt-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-sm text-text-secondary">Download</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {firstNet ? formatBytes(firstNet.rxBytes) : '—'}
              </div>
              {firstNet?.rxSec !== null && firstNet?.rxSec !== undefined && (
                <div className="text-xs text-text-secondary mt-0.5">{formatBytes(firstNet.rxSec)}/s</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Wifi className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-sm text-text-secondary">Upload</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {firstNet ? formatBytes(firstNet.txBytes) : '—'}
              </div>
              {firstNet?.txSec !== null && firstNet?.txSec !== undefined && (
                <div className="text-xs text-text-secondary mt-0.5">{formatBytes(firstNet.txSec)}/s</div>
              )}
            </div>
          </div>
        </Card>

        <Card title="System Info">
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-sm text-text-secondary mb-1">Hostname</div>
              <div className="text-sm font-medium text-white truncate">{overview?.os.hostname ?? '—'}</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Platform</div>
              <div className="text-sm font-medium text-white">
                {overview ? `${overview.os.platform} ${overview.os.arch}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Uptime</div>
              <div className="text-sm font-medium text-white">{overview ? formatUptime(overview.uptime) : '—'}</div>
            </div>
            <div className="col-span-3">
              <div className="text-sm text-text-secondary mb-1">OS</div>
              <div className="text-sm font-medium text-white">
                {overview ? `${overview.os.distro} ${overview.os.release}` : '—'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* CPU Per Core */}
      {cpuCoresData.length > 0 && (
        <Card title="CPU Per Core">
          <div className="h-[150px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cpuCoresData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={Math.max(12, Math.min(32, 200 / cpuCoresData.length))}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e2532', borderColor: '#2a3441', borderRadius: '8px', color: '#fff' }}
                  formatter={((v: number) => [`${v}%`, 'Load']) as never}
                />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} label={{ position: 'top', fill: '#e2e8f0', fontSize: 11, formatter: ((v: number) => `${v}%`) as never }}>
                  {cpuCoresData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
