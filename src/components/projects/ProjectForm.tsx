import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import type { Project, CreateProjectPayload } from '../../types/api';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ project, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectPayload>({
    name: '',
    displayName: '',
    path: '',
    repoUrl: '',
    branch: 'main',
    installCommand: 'npm install',
    buildCommand: '',
    startCommand: '',
    healthUrl: '',
    healthTimeout: 30,
    envPath: '',
    port: undefined,
    notifyOnDeploy: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        displayName: project.display_name || '',
        path: project.path,
        repoUrl: project.repo_url || '',
        branch: project.branch || 'main',
        installCommand: project.install_command || 'npm install',
        buildCommand: project.build_command || '',
        startCommand: project.start_command || '',
        healthUrl: project.health_url || '',
        healthTimeout: project.health_timeout || 30,
        envPath: project.env_path || '',
        port: project.port || undefined,
        notifyOnDeploy: project.notify_on_deploy === 1,
      });
    }
  }, [project]);

  const handleChange = (
    field: keyof CreateProjectPayload,
    value: string | number | boolean | undefined,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên project là bắt buộc';
    } else if (!/^[a-z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Chỉ a-z, 0-9, -, _';
    }

    if (!formData.path.trim()) {
      newErrors.path = 'Đường dẫn là bắt buộc';
    }

    if (formData.port && (formData.port < 1 || formData.port > 65535)) {
      newErrors.port = 'Port không hợp lệ (1-65535)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isEditing = !!project;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tên Project"
          placeholder="api-server"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          error={errors.name}
          disabled={isEditing}
        />
        <Input
          label="Tên hiển thị"
          placeholder="API Server"
          value={formData.displayName}
          onChange={e => handleChange('displayName', e.target.value)}
        />
      </div>

      <Input
        label="Đường dẫn thư mục"
        placeholder="C:/Projects/api-server"
        value={formData.path}
        onChange={e => handleChange('path', e.target.value)}
        error={errors.path}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Git Repository URL"
          placeholder="https://github.com/org/repo.git"
          value={formData.repoUrl}
          onChange={e => handleChange('repoUrl', e.target.value)}
        />
        <Input
          label="Branch"
          placeholder="main"
          value={formData.branch}
          onChange={e => handleChange('branch', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Lệnh cài đặt"
          placeholder="npm install"
          value={formData.installCommand}
          onChange={e => handleChange('installCommand', e.target.value)}
        />
        <Input
          label="Lệnh build"
          placeholder="npm run build"
          value={formData.buildCommand}
          onChange={e => handleChange('buildCommand', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Lệnh chạy"
          placeholder="npm start"
          value={formData.startCommand}
          onChange={e => handleChange('startCommand', e.target.value)}
        />
        <Input
          label="Port"
          placeholder="3000"
          type="number"
          value={formData.port || ''}
          onChange={e => handleChange('port', e.target.value ? parseInt(e.target.value) : undefined)}
          error={errors.port}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Health Check URL"
          placeholder="http://localhost:3000/health"
          value={formData.healthUrl}
          onChange={e => handleChange('healthUrl', e.target.value)}
        />
        <Input
          label="Health Timeout (giây)"
          placeholder="30"
          type="number"
          value={formData.healthTimeout}
          onChange={e => handleChange('healthTimeout', parseInt(e.target.value) || 30)}
        />
      </div>

      <Input
        label="Đường dẫn .env"
        placeholder="C:/Projects/api-server/.env"
        value={formData.envPath}
        onChange={e => handleChange('envPath', e.target.value)}
      />

      <Switch
        label="Thông báo khi deploy"
        checked={formData.notifyOnDeploy}
        onChange={e => handleChange('notifyOnDeploy', e.target.checked)}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Cập nhật' : 'Tạo Project'}
        </Button>
      </div>
    </form>
  );
}
