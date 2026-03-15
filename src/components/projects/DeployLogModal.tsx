import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DeployLog } from '../../types/api';

interface DeployLogModalProps {
  deploy: DeployLog;
  onClose: () => void;
}

export function DeployLogModal({ deploy, onClose }: DeployLogModalProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'error'>('output');

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">Success</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded">Failed</span>;
      case 'running':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded">Running</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400 rounded">{status}</span>;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Chi tiết Deploy"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {/* Deploy Info */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
        {getStatusBadge(deploy.status)}
        <div className="flex-1">
          <p className="text-sm text-text-secondary">
            Bắt đầu: {new Date(deploy.started_at).toLocaleString('vi-VN')}
          </p>
          {deploy.finished_at && (
            <p className="text-sm text-text-secondary">
              Kết thúc: {new Date(deploy.finished_at).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary">Thời gian</p>
          <p className="text-white font-medium">{formatDuration(deploy.duration_ms)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveTab('output')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            activeTab === 'output'
              ? 'bg-accent-blue text-white'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveTab('error')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            activeTab === 'error'
              ? 'bg-red-500 text-white'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          Error
          {deploy.error && <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block" />}
        </button>
      </div>

      {/* Content */}
      <div className="bg-bg-main rounded-lg p-3 font-mono text-xs max-h-80 overflow-auto">
        {activeTab === 'output' ? (
          deploy.output ? (
            <pre className="whitespace-pre-wrap text-green-400">{deploy.output}</pre>
          ) : (
            <p className="text-text-secondary italic">Không có output</p>
          )
        ) : (
          deploy.error ? (
            <pre className="whitespace-pre-wrap text-red-400">{deploy.error}</pre>
          ) : (
            <p className="text-text-secondary italic">Không có lỗi</p>
          )
        )}
      </div>
    </Modal>
  );
}
