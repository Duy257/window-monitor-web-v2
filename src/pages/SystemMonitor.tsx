import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Cpu, MemoryStick, HardDrive, Network } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useCpuDetail, useMemoryDetail, useDiskDetail, useNetworkDetail, useRollingHistory } from '../hooks/useSystem';

/** Chuyển bytes sang dạng đọc được */
function fmtBytes(bytes: number, decimals = 1): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sz = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sz[i]}`;
}

/** Chuyển bytes/s sang dạng đọc được */
function fmtSpeed(bps: number | null): string {
  if (bps === null || bps < 0) return '—';
  return `${fmtBytes(bps)}/s`;
}

/** SVG circle progress */
function CircleGauge({ percent, color, label }: { percent: number; color: string; label: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(percent, 100) / 100);
  return (
    <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-slate-800 shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <div className="text-xl font-bold text-white">{Math.round(percent)}%</div>
        <div className="text-[10px] text-text-secondary">{label}</div>
      </div>
    </div>
  );
}

export function SystemMonitor() {
  const { data: cpu } = useCpuDetail();
  const { data: mem } = useMemoryDetail();
  const { data: disk } = useDiskDetail();
  const { data: net } = useNetworkDetail();

  // Rolling history cho mini charts
  const cpuHistory = useRollingHistory(cpu?.usage, 30);
  const memHistory = useRollingHistory(mem?.usagePercent, 30);

  // Dữ liệu traffic theo giây (cộng tất cả interfaces)
  const rxSec = useMemo(() => {
    if (!net?.traffic) return null;
    return net.traffic.reduce((sum, t) => sum + (t.rxSec ?? 0), 0);
  }, [net]);
  const txSec = useMemo(() => {
    if (!net?.traffic) return null;
    return net.traffic.reduce((sum, t) => sum + (t.txSec ?? 0), 0);
  }, [net]);

  const rxHistory = useRollingHistory(rxSec ?? undefined, 30);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: CPU */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white">CPU</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Real-time
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-4">
              <CircleGauge percent={cpu?.usage ?? 0} color="#3b82f6" label="CPU" />
              <div className="space-y-1 text-sm">
                <div className="flex gap-2"><span className="text-text-secondary w-12">Model</span> <span className="text-white text-xs">{cpu?.brand ?? '—'}</span></div>
                <div className="flex gap-2"><span className="text-text-secondary w-12">Speed</span> <span className="text-white">{cpu ? `${cpu.speed} GHz` : '—'}</span></div>
                <div className="flex gap-2"><span className="text-text-secondary w-12">Cores</span> <span className="text-white">{cpu ? `${cpu.cores} logical / ${cpu.physicalCores} physical` : '—'}</span></div>
                <div className="flex gap-2"><span className="text-text-secondary w-12">Temp</span> <span className="text-white">{cpu?.temperature ? `${cpu.temperature}°C` : 'N/A'}</span></div>
              </div>
            </div>
            <div className="md:col-span-2 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuHistory}>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per Core Load */}
          {cpu?.perCore && cpu.perCore.length > 0 && (
            <div>
              <h4 className="text-sm text-text-secondary mb-4">Per Core Load</h4>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {cpu.perCore.map((load, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-6 w-full bg-slate-800 rounded-md overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(load, 100)}%`,
                          backgroundColor: load > 80 ? '#f97316' : load > 50 ? '#a855f7' : '#3b82f6',
                        }}
                      />
                    </div>
                    <div className="text-xs text-center text-text-secondary">C{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Memory */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <MemoryStick className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Memory</h3>
          </div>
          <div className="flex items-center gap-6">
            <CircleGauge percent={mem?.usagePercent ?? 0} color="#a855f7" label="RAM" />
            <div className="space-y-1 flex-1 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Total</span> <span className="text-white">{mem ? fmtBytes(mem.total) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Used</span> <span className="text-white">{mem ? fmtBytes(mem.used) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Free</span> <span className="text-white">{mem ? fmtBytes(mem.free) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Swap</span> <span className="text-white">{mem ? `${fmtBytes(mem.swapUsed)} / ${fmtBytes(mem.swapTotal)}` : '—'}</span></div>
            </div>
          </div>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memHistory}>
                <Area type="monotone" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Disk */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <HardDrive className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-medium text-white">Disk Storage</h3>
          </div>
          <div className="space-y-4">
            {disk && disk.length > 0 ? disk.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white font-medium">{d.mount} {d.type}</span>
                  <span className="text-text-secondary">
                    {fmtBytes(d.used)} / {fmtBytes(d.size)}
                    <span className="text-white ml-2">{d.usagePercent.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.usagePercent}%`,
                      backgroundColor: d.usagePercent > 90 ? '#ef4444' : d.usagePercent > 70 ? '#f97316' : '#3b82f6',
                    }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-text-secondary text-sm">Đang tải...</p>
            )}
          </div>
        </Card>

        {/* Network */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Network</h3>
          </div>
          <div className="space-y-2 mb-4 text-sm">
            {net?.interfaces.slice(0, 3).map((iface, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <div className="text-white font-medium text-xs">{iface.iface}</div>
                  <div className="text-text-secondary text-xs">{iface.ip4 || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-text-secondary text-xs">{iface.mac}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-text-secondary mb-2 flex justify-between">
            <span>Real-time Traffic</span>
            <div className="flex gap-3">
              <span className="text-blue-400">↓ {fmtSpeed(rxSec)}</span>
              <span className="text-purple-400">↑ {fmtSpeed(txSec)}</span>
            </div>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rxHistory}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="step" dataKey="value" stroke="#3b82f6" fill="url(#colorNet)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
