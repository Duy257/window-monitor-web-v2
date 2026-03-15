import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Play, RefreshCw, Trash2, Plus, ChevronDown,
  ChevronRight, Loader2, AlertCircle, CheckCircle2, XCircle, Edit, ExternalLink
} from 'lucide-react';
import { useProjects, useDeployProject, useDeleteProject, useProjectDeploys, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import { usePm2Apps, useRestartApp, useStopApp } from '../hooks/usePm2';
import { Modal } from '../components/ui/Modal';
import { ProjectForm, DeployLogModal } from '../components/projects';
import { Project, DeployLog, CreateProjectPayload } from '../types/api';

/** Chip trạng thái deploy */
function DeployStatus({ status }: { status: string }) {
  if (status === 'success') return <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>;
  if (status === 'failed') return <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Failed</span>;
  return <span className="flex items-center gap-1 text-yellow-400 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running</span>;
}

/** Panel lịch sử deploy */
function DeployHistory({ projectName, onSelectDeploy }: { projectName: string; onSelectDeploy: (deploy: DeployLog) => void }) {
  const { data: deploys, isLoading } = useProjectDeploys(projectName);
  if (isLoading) return <div className="py-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /></div>;
  if (!deploys?.length) return <p className="text-text-secondary text-xs py-3">Chưa có deploy nào.</p>;
  return (
    <div className="space-y-1.5 mt-2">
      {deploys.slice(0, 10).map((d: DeployLog) => (
        <div
          key={d.id}
          onClick={() => onSelectDeploy(d)}
          className="flex items-center justify-between text-xs px-3 py-2 bg-bg-main rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
        >
          <DeployStatus status={d.status} />
          <span className="text-text-secondary">{new Date(d.started_at).toLocaleString('vi-VN')}</span>
        </div>
      ))}
    </div>
  );
}

/** Card một project */
interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onSelectDeploy: (deploy: DeployLog) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onSelectDeploy }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { mutateAsync: deploy, isPending: isDeploying } = useDeployProject();
  const { mutateAsync: deleteP, isPending: isDeleting } = useDeleteProject();
  const { data: pm2Apps } = usePm2Apps();
  const { mutateAsync: restart } = useRestartApp();
  const { mutateAsync: stop } = useStopApp();

  // Tìm PM2 app tương ứng
  const pm2App = pm2Apps?.find(a => a.name === project.name);
  const isOnline = pm2App?.status === 'online';

  const handleDeploy = async () => {
    try { await deploy(project.name); } catch { /* lỗi sẽ hiện ở console */ }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    navigate(`/projects/${project.name}`);
  };

  return (
    <div
      className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-colors"
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-600'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{project.display_name || project.name}</h3>
                <ExternalLink className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-text-secondary font-mono mt-0.5 truncate max-w-xs">{project.path}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {pm2App && (
              <>
                <button
                  onClick={() => restart(project.name)}
                  className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="Restart"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => stop(project.name)}
                  className="p-1.5 text-text-secondary hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                  title="Stop"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isDeploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Deploy
            </button>
            <button
              onClick={() => deleteP(project.name)}
              disabled={isDeleting}
              className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {project.port && <div><span className="text-text-secondary">Port: </span><span className="text-white">{project.port}</span></div>}
          {project.branch && <div><span className="text-text-secondary">Branch: </span><span className="text-white">{project.branch}</span></div>}
          {pm2App && <div><span className="text-text-secondary">Restarts: </span><span className="text-white">{pm2App.restarts ?? 0}</span></div>}
        </div>

        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-white mt-3 transition-colors"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          Lịch sử Deploy
        </button>

        {expanded && <DeployHistory projectName={project.name} onSelectDeploy={onSelectDeploy} />}
      </div>
    </div>
  );
}

export function Projects() {
  const { data: projects, isLoading, isError } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDeploy, setSelectedDeploy] = useState<DeployLog | null>(null);

  const handleCreateProject = async (data: CreateProjectPayload) => {
    try {
      await createProject.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (data: CreateProjectPayload) => {
    if (!editingProject) return;
    try {
      await updateProject.mutateAsync({ name: editingProject.name, payload: data });
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (isError) return (
    <div className="flex items-center gap-2 text-red-400 p-6">
      <AlertCircle className="w-5 h-5" /> Không thể tải danh sách projects.
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-400" /> Projects
        </h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      )}

      {!isLoading && !projects?.length && (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <FolderKanban className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Chưa có project nào. Thêm project đầu tiên của bạn.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects?.map(p => <ProjectCard key={p.id} project={p} onEdit={openEditModal} onSelectDeploy={setSelectedDeploy} />)}
      </div>

      {/* Modal tạo/cập nhật project */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? 'Cập nhật Project' : 'Tạo Project mới'}
      >
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={closeModal}
          isLoading={createProject.isPending || updateProject.isPending}
        />
      </Modal>

      {/* Modal chi tiết deploy */}
      {selectedDeploy && (
        <DeployLogModal
          deploy={selectedDeploy}
          onClose={() => setSelectedDeploy(null)}
        />
      )}
    </div>
  );
}
