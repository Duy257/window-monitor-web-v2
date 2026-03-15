import React, { useState } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle, CheckCircle2, XCircle, Mail, MessageSquare } from 'lucide-react';
import { useAlertRules, useAlertLogs, useAlertChannels, useToggleAlertRule, useDeleteAlertRule } from '../hooks/useAlerts';
import { AlertRule } from '../types/api';

type AlertTab = 'rules' | 'history' | 'channels';

/** Chip metric */
const METRIC_LABELS: Record<string, string> = {
  cpu_usage: 'CPU', ram_usage: 'RAM', disk_usage: 'Disk', net_error: 'Net Error', process_down: 'Process Down'
};
const OPERATOR_LABELS: Record<string, string> = { gt: '>', lt: '<', gte: '≥', lte: '≤' };

/** Card rule */
const RuleRow: React.FC<{ rule: AlertRule }> = ({ rule }) => {
  const { mutateAsync: toggle, isPending: isToggling } = useToggleAlertRule();
  const { mutateAsync: del, isPending: isDeleting } = useDeleteAlertRule();
  return (
    <tr className="border-b border-border-subtle/30 hover:bg-white/5 group transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-400' : 'bg-slate-600'}`} />
          <span className="text-white text-sm font-medium">{rule.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded text-xs">{METRIC_LABELS[rule.metric] ?? rule.metric}</span>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-white">
        {OPERATOR_LABELS[rule.operator]} {rule.threshold}
        {['cpu_usage', 'ram_usage', 'disk_usage'].includes(rule.metric) ? '%' : ''}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{rule.duration_seconds}s</td>
      <td className="px-4 py-3">
        <button onClick={() => toggle(rule.id)} disabled={isToggling} className="transition-colors">
          {rule.enabled
            ? <ToggleRight className="w-6 h-6 text-green-400 hover:text-green-300" />
            : <ToggleLeft className="w-6 h-6 text-slate-600 hover:text-slate-400" />}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => del(rule.id)}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-1 text-red-400/50 hover:text-red-400 rounded transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export function Alerts() {
  const [tab, setTab] = useState<AlertTab>('rules');
  const { data: rules, isLoading: loadingRules } = useAlertRules();
  const { data: logs, isLoading: loadingLogs } = useAlertLogs(50);
  const { data: channels } = useAlertChannels();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" /> Alerts
        </h2>
        {tab === 'rules' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle">
        {(['rules', 'history', 'channels'] as AlertTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            {t === 'rules' ? 'Rules' : t === 'history' ? 'Lịch sử' : 'Channels'}
          </button>
        ))}
      </div>

      {/* Rules Tab */}
      {tab === 'rules' && (
        <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
          {loadingRules && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>}
          {!loadingRules && (
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-border-subtle">
                <tr className="text-text-secondary text-sm">
                  <th className="px-4 py-3 font-medium">Tên rule</th>
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 font-medium">Điều kiện</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rules?.map(r => <RuleRow key={r.id} rule={r} />)}
                {!rules?.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary text-sm">
                    Chưa có alert rule nào. Nhấn &quot;Add Rule&quot; để thêm.
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
          {loadingLogs && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>}
          <div className="divide-y divide-border-subtle/30">
            {logs?.map(log => (
              <div key={log.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-sm text-white">{log.message}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Giá trị: {log.value} · Kênh: {log.channel}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-text-secondary shrink-0">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
            {!loadingLogs && !logs?.length && (
              <p className="px-5 py-8 text-center text-text-secondary text-sm">Chưa có alert log nào.</p>
            )}
          </div>
        </div>
      )}

      {/* Channels Tab */}
      {tab === 'channels' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'telegram', label: 'Telegram', icon: MessageSquare, color: 'text-blue-400' },
            { key: 'email', label: 'Email', icon: Mail, color: 'text-green-400' },
            { key: 'slack', label: 'Slack', icon: MessageSquare, color: 'text-purple-400' },
            { key: 'discord', label: 'Discord', icon: MessageSquare, color: 'text-indigo-400' },
          ].map(c => {
            const configured = channels?.[c.key as keyof typeof channels]?.configured ?? false;
            return (
              <div key={c.key} className="bg-bg-card border border-border-subtle rounded-xl p-5 flex flex-col items-center gap-3">
                <c.icon className={`w-8 h-8 ${c.color}`} />
                <span className="text-white font-medium">{c.label}</span>
                {configured
                  ? <span className="flex items-center gap-1.5 text-green-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Đã cấu hình</span>
                  : <span className="flex items-center gap-1.5 text-slate-500 text-xs"><XCircle className="w-3.5 h-3.5" /> Chưa cấu hình</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
