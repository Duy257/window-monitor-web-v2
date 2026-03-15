import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, RefreshCw, Trash2, XCircle, Loader2,
  Activity, Terminal, Settings, Clock, CheckCircle2,
  XCircle as XCircleIcon, AlertCircle, Cpu, Zap,
  FolderOpen, Database
} from 'lucide-react';
import { useProject, useProjectDeploys, useDeployProject, useProjectPm2, useRestartPm2App, useStopPm2App, useFlushPm2Logs } from '../hooks/useProjectDetail';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ProjectForm } from '../components/projects/ProjectForm';
import { DeployLogModal } from '../components/projects/DeployLogModal';
import type { DeployLog, CreateProjectPayload } from '../types/api';
import { ProjectTerminalXterm } from '../components/projects/ProjectTerminalXterm';

/** Tab types */
type TabType = 'overview' | 'deploys' | 'terminal' | 'files' | 'settings';

/** Tab configuration */
const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Tổng quan', icon: <Activity className="w-4 h-4" /> },
  { id: 'deploys', label: 'Deploys', icon: <Clock className="w-4 h-4" /> },
  { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
  { id: 'files', label: 'Files', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'settings', label: 'Cấu hình', icon: <Settings className="w-4 h-4" /> },
];

/** Deploy status chip */
function DeployStatus({ status }: { status: string }) {
  if (status === 'success') return <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>;
  if (status === 'failed') return <span className="flex items-center gap-1 text-red-400 text-xs"><XCircleIcon className="w-3.5 h-3.5" /> Failed</span>;
  return <span className="flex items-center gap-1 text-yellow-400 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running</span>;
}

/** Stat Card */
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-secondary mb-1">{label}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/** Overview Tab */
function OverviewTab({ projectName, onDeploy, onRestart, onStop, onFlush }: {
  projectName: string;
  onDeploy: () => void;
  onRestart: () => void;
  onStop: () => void;
  onFlush: () => void;
}) {
  const { data: project, isLoading: loadingProject } = useProject(projectName);
  const { data: pm2App, isLoading: loadingPm2 } = useProjectPm2(projectName);
  const { data: deploys } = useProjectDeploys(projectName);
  const { isPending: isDeploying } = useDeployProject();

  const lastDeploy = deploys?.[0];
  const isOnline = pm2App?.status === 'online';

  if (loadingProject || loadingPm2) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status & Actions */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-600'} ${pm2App?.status === 'stopped' ? 'bg-orange-400' : ''}`} />
            <div>
              <h3 className="text-lg font-semibold text-white">{project?.display_name || project?.name}</h3>
              <p className="text-sm text-text-secondary">{pm2App?.status || 'unknown'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onRestart} disabled={!pm2App}>
              <RefreshCw className="w-4 h-4" /> Restart
            </Button>
            <Button variant="secondary" size="sm" onClick={onStop} disabled={!pm2App}>
              <XCircle className="w-4 h-4" /> Stop
            </Button>
            <Button variant="secondary" size="sm" onClick={onFlush} disabled={!pm2App}>
              <Trash2 className="w-4 h-4" /> Flush Logs
            </Button>
            <Button size="sm" onClick={onDeploy} isLoading={isDeploying}>
              <Play className="w-4 h-4" /> Deploy
            </Button>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-secondary text-xs">Đường dẫn</p>
            <p className="text-white font-mono truncate" title={project?.path}>{project?.path}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">Repository</p>
            <p className="text-white truncate" title={project?.repo_url || '-'}>{project?.repo_url || '-'}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">Branch</p>
            <p className="text-white">{project?.branch || 'main'}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">Port</p>
            <p className="text-white">{project?.port || '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="CPU"
          value={pm2App?.cpu ? `${pm2App.cpu.toFixed(1)}%` : '-'}
          icon={<Cpu className="w-5 h-5 text-blue-400" />}
          color="bg-blue-500/10"
        />
        <StatCard
          label="Memory"
          value={pm2App?.memory ? `${(pm2App.memory / 1024 / 1024).toFixed(1)} MB` : '-'}
          icon={<Database className="w-5 h-5 text-purple-400" />}
          color="bg-purple-500/10"
        />
        <StatCard
          label="Restarts"
          value={pm2App?.restarts ?? 0}
          icon={<RefreshCw className="w-5 h-5 text-orange-400" />}
          color="bg-orange-500/10"
        />
        <StatCard
          label="Uptime"
          value={pm2App?.uptime ? `${Math.floor(pm2App.uptime / 3600)}h` : '-'}
          icon={<Zap className="w-5 h-5 text-green-400" />}
          color="bg-green-500/10"
        />
      </div>

      {/* Last Deploy */}
      {lastDeploy && (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
          <h4 className="text-sm font-medium text-text-secondary mb-3">Deploy gần nhất</h4>
          <div className="flex items-center justify-between">
            <DeployStatus status={lastDeploy.status} />
            <span className="text-sm text-text-secondary">
              {new Date(lastDeploy.started_at).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Deploys Tab */
function DeploysTab({ projectName, onSelectDeploy }: { projectName: string; onSelectDeploy: (deploy: DeployLog) => void }) {
  const { data: deploys, isLoading } = useProjectDeploys(projectName);
  const { mutateAsync: deploy, isPending } = useDeployProject();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Lịch sử Deploy</h3>
        <Button size="sm" onClick={() => deploy(projectName)} isLoading={isPending}>
          <Play className="w-4 h-4" /> Deploy Now
        </Button>
      </div>

      {!deploys?.length ? (
        <div className="text-center py-12 text-text-secondary">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có deploy nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deploys.map((deploy) => (
            <div
              key={deploy.id}
              onClick={() => onSelectDeploy(deploy)}
              className="bg-bg-card border border-border-subtle rounded-xl p-4 cursor-pointer hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DeployStatus status={deploy.status} />
                  <span className="text-sm text-text-secondary">
                    {new Date(deploy.started_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                {deploy.duration_ms && (
                  <span className="text-xs text-text-secondary">
                    {Math.floor(deploy.duration_ms / 1000)}s
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Terminal Tab - xterm.js + node-pty session */
function TerminalTab({ projectName, projectPath }: { projectName: string; projectPath: string }) {
  return <ProjectTerminalXterm projectName={projectName} projectPath={projectPath} />;
}

/** Files Tab - Simple file browser placeholder */
function FilesTab({ projectPath }: { projectPath: string }) {
  // This would integrate with the existing Files page
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Files</h3>
        <div className="text-sm text-text-secondary">
          Path: <span className="font-mono">{projectPath}</span>
        </div>
      </div>

      <div className="bg-bg-card border border-border-subtle rounded-xl p-8 text-center">
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-text-secondary opacity-30" />
        <p className="text-text-secondary">File browser for project files</p>
        <p className="text-sm text-text-secondary mt-1">Coming soon - integrate with Files page</p>
      </div>
    </div>
  );
}

/** Settings Tab */
function SettingsTab({ projectName, onUpdate, onDelete }: {
  projectName: string;
  onUpdate: (data: CreateProjectPayload) => void;
  onDelete: () => void;
}) {
  const { data: project, isLoading } = useProject(projectName);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Cấu hình Project</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
            <Settings className="w-4 h-4" /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-secondary">Tên Project</p>
            <p className="text-white">{project?.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Tên hiển thị</p>
            <p className="text-white">{project?.display_name || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-text-secondary">Đường dẫn</p>
            <p className="text-white font-mono">{project?.path}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Repository</p>
            <p className="text-white">{project?.repo_url || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Branch</p>
            <p className="text-white">{project?.branch || 'main'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Lệnh cài đặt</p>
            <p className="text-white font-mono text-sm">{project?.install_command || 'npm install'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Lệnh build</p>
            <p className="text-white font-mono text-sm">{project?.build_command || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Lệnh chạy</p>
            <p className="text-white font-mono text-sm">{project?.start_command || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Port</p>
            <p className="text-white">{project?.port || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Health Check URL</p>
            <p className="text-white">{project?.health_url || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Thông báo khi deploy</p>
            <p className="text-white">{project?.notify_on_deploy ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Chỉnh sửa Project">
        <ProjectForm
          project={project || undefined}
          onSubmit={(data) => {
            onUpdate(data);
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xóa Project">
        <div className="space-y-4">
          <p className="text-text-secondary">
            Bạn có chắc chắn muốn xóa project <span className="text-white font-medium">{projectName}</span>?
          </p>
          <p className="text-sm text-red-400">Lưu ý: Code trên server sẽ không bị xóa, chỉ xóa khỏi hệ thống giám sát.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={() => { onDelete(); setIsDeleteModalOpen(false); }}>Xóa</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/** Main ProjectDetail Page */
export function ProjectDetail() {
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedDeploy, setSelectedDeploy] = useState<DeployLog | null>(null);

  const { data: project, isLoading, isError } = useProject(projectName);
  const { mutateAsync: deploy } = useDeployProject();
  const { mutateAsync: restart } = useRestartPm2App();
  const { mutateAsync: stop } = useStopPm2App();
  const { mutateAsync: flush } = useFlushPm2Logs();

  const handleDeploy = async () => {
    if (!projectName) return;
    try {
      await deploy(projectName);
    } catch (error) {
      console.error('Deploy failed:', error);
    }
  };

  const handleRestart = async () => {
    if (!projectName) return;
    try {
      await restart(projectName);
    } catch (error) {
      console.error('Restart failed:', error);
    }
  };

  const handleStop = async () => {
    if (!projectName) return;
    try {
      await stop(projectName);
    } catch (error) {
      console.error('Stop failed:', error);
    }
  };

  const handleFlush = async () => {
    if (!projectName) return;
    try {
      await flush(projectName);
    } catch (error) {
      console.error('Flush failed:', error);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-text-secondary mb-4">Không thể tải thông tin project</p>
        <Button onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">{project?.display_name || project?.name}</h1>
          <p className="text-sm text-text-secondary">{project?.path}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-blue-400'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && projectName && (
          <OverviewTab
            projectName={projectName}
            onDeploy={handleDeploy}
            onRestart={handleRestart}
            onStop={handleStop}
            onFlush={handleFlush}
          />
        )}

        {activeTab === 'deploys' && projectName && (
          <DeploysTab
            projectName={projectName}
            onSelectDeploy={setSelectedDeploy}
          />
        )}

        {activeTab === 'terminal' && project && (
          <TerminalTab projectName={project.name} projectPath={project.path} />
        )}

        {activeTab === 'files' && project && (
          <FilesTab projectPath={project.path} />
        )}

        {activeTab === 'settings' && projectName && (
          <SettingsTab
            projectName={projectName}
            onUpdate={(data) => console.log('Update:', data)}
            onDelete={() => navigate('/projects')}
          />
        )}
      </div>

      {/* Deploy Detail Modal */}
      {selectedDeploy && (
        <DeployLogModal
          deploy={selectedDeploy}
          onClose={() => setSelectedDeploy(null)}
        />
      )}
    </div>
  );
}
