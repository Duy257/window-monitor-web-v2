import React, { useState } from 'react';
import { ListTodo, Play, ToggleLeft, ToggleRight, Trash2, ChevronRight, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useJobs, useJobHistory, useRunJob, useToggleJob, useDeleteJob } from '../hooks/useJobs';
import { CronJob } from '../types/api';

const JOB_TYPE_COLORS: Record<string, string> = {
  command: 'text-blue-400 bg-blue-400/10',
  http: 'text-green-400 bg-green-400/10',
  deploy: 'text-purple-400 bg-purple-400/10',
  cleanup: 'text-orange-400 bg-orange-400/10',
  backup: 'text-yellow-400 bg-yellow-400/10',
  script: 'text-cyan-400 bg-cyan-400/10',
};

/** Lịch sử chạy job */
function JobHistoryPanel({ jobId }: { jobId: number }) {
  const { data: history, isLoading } = useJobHistory(jobId);
  if (isLoading) return <div className="py-3 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /></div>;
  if (!history?.length) return <p className="text-text-secondary text-xs py-2">Chưa có lần chạy nào.</p>;
  return (
    <div className="mt-2 space-y-1">
      {history.slice(0, 8).map(h => (
        <div key={h.id} className="flex items-center justify-between text-xs px-3 py-1.5 bg-bg-main rounded-lg">
          <div className="flex items-center gap-2">
            {h.status === 'success'
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              : h.status === 'failed'
              ? <XCircle className="w-3.5 h-3.5 text-red-400" />
              : <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />}
            <span className="text-text-secondary">{new Date(h.executed_at).toLocaleString('vi-VN')}</span>
          </div>
          {h.duration_ms && <span className="text-text-secondary">{h.duration_ms}ms</span>}
        </div>
      ))}
    </div>
  );
}

/** Card một job */
const JobCard: React.FC<{ job: CronJob }> = ({ job }) => {
  const [expanded, setExpanded] = useState(false);
  const { mutateAsync: runJob, isPending: isRunning } = useRunJob();
  const { mutateAsync: toggle, isPending: isToggling } = useToggleJob();
  const { mutateAsync: del, isPending: isDeleting } = useDeleteJob();
  const typeClass = JOB_TYPE_COLORS[job.type] ?? 'text-slate-400 bg-slate-400/10';

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${job.enabled ? 'bg-green-400' : 'bg-slate-600'}`} />
            <div>
              <h3 className="font-semibold text-white">{job.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeClass}`}>{job.type}</span>
                <code className="text-xs text-text-secondary font-mono bg-bg-main px-2 py-0.5 rounded">{job.cron_expression}</code>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => runJob(job.id)}
              disabled={isRunning}
              title="Chạy ngay"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 disabled:opacity-50 border border-green-600/30 transition-colors"
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run
            </button>
            <button onClick={() => toggle(job.id)} disabled={isToggling} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
              {job.enabled
                ? <ToggleRight className="w-5 h-5 text-green-400" />
                : <ToggleLeft className="w-5 h-5 text-slate-600" />}
            </button>
            <button
              onClick={() => del(job.id)}
              disabled={isDeleting}
              className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {job.last_run_at && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Clock className="w-3 h-3" />
            Chạy lần cuối: {new Date(job.last_run_at).toLocaleString('vi-VN')}
          </div>
        )}

        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-white mt-3 transition-colors"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          Lịch sử chạy
        </button>
        {expanded && <JobHistoryPanel jobId={job.id} />}
      </div>
    </div>
  );
};

export function Jobs() {
  const { data: jobs, isLoading } = useJobs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-green-400" /> Cron Jobs
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          + New Job
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      )}

      {!isLoading && !jobs?.length && (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <ListTodo className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Chưa có cron job nào.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jobs?.map(j => <JobCard key={j.id} job={j} />)}
      </div>
    </div>
  );
}
