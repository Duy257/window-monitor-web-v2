import { useState } from 'react';
import {
  Search, Folder, FileJson, FileCode, FileText,
  File as FileIcon, ChevronRight, ArrowLeft,
  Trash2, FolderPlus, Download, Eye, AlertCircle, Loader2
} from 'lucide-react';
import { useListDir, useReadFile, useDeleteFile, useCreateDir, downloadFile } from '../hooks/useFiles';
import { FileEntry } from '../types/api';
import { FILE_DEFAULT_PATH, LOCALE } from '../config';

/** Lấy extension từ tên file */
function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

/** Icon theo loại file/thư mục */
function FileIcon2({ entry }: { entry: FileEntry }) {
  if (entry.isDirectory) return <Folder className="w-5 h-5 text-blue-400 fill-blue-400/20 shrink-0" />;
  const ext = getExt(entry.name);
  if (['json', 'lock'].includes(ext)) return <FileJson className="w-5 h-5 text-orange-400 shrink-0" />;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'sh', 'bat', 'ps1'].includes(ext)) return <FileCode className="w-5 h-5 text-yellow-400 shrink-0" />;
  if (['md', 'txt', 'log', 'csv'].includes(ext)) return <FileText className="w-5 h-5 text-blue-300 shrink-0" />;
  return <FileIcon className="w-5 h-5 text-slate-400 shrink-0" />;
}

/** Chuyển bytes sang string */
function fmtSize(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Format ngày */
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Default path lấy từ env VITE_FILE_DEFAULT_PATH
const DEFAULT_PATH = FILE_DEFAULT_PATH;

export function Files() {
  const [currentPath, setCurrentPath] = useState<string>(DEFAULT_PATH);
  const [search, setSearch] = useState('');
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [showNewDir, setShowNewDir] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: entries, isLoading, isError, error } = useListDir(currentPath);
  const { data: fileContent, isLoading: isLoadingContent } = useReadFile(previewPath);
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { mutateAsync: createDir } = useCreateDir();

  // Tạo breadcrumb từ path
  const pathParts = currentPath.replace(/\\/g, '/').split('/').filter(Boolean);

  const filteredEntries = entries?.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleNavigate = (entry: FileEntry) => {
    if (entry.isDirectory) {
      setCurrentPath(entry.path.replace(/\\/g, '/'));
      setSearch('');
    } else {
      // Chỉ preview file text nhỏ
      if (entry.size <= 1024 * 1024) {
        setPreviewPath(entry.path.replace(/\\/g, '/'));
      }
    }
  };

  const handleBreadcrumb = (index: number) => {
    const newPath = pathParts.slice(0, index + 1).join('/');
    setCurrentPath(newPath.startsWith('C:') ? newPath : `/${newPath}`);
  };

  const handleCreateDir = async () => {
    if (!newDirName.trim()) return;
    const fullPath = `${currentPath}/${newDirName.trim()}`;
    try {
      await createDir(fullPath);
      setNewDirName('');
      setShowNewDir(false);
    } catch {
      // Lỗi hiển thị qua toast sau
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await deleteFile(path);
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-text-secondary overflow-x-auto">
          {pathParts.map((part, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              <button
                onClick={() => handleBreadcrumb(i)}
                className="hover:text-white transition-colors px-1 rounded hover:bg-white/5"
              >
                {part}
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
          <button
            onClick={() => setShowNewDir(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/10 rounded-lg border border-border-subtle transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* New Folder Input */}
      {showNewDir && (
        <div className="flex items-center gap-2 p-3 bg-bg-card border border-blue-500/30 rounded-lg">
          <FolderPlus className="w-4 h-4 text-blue-400" />
          <input
            autoFocus
            type="text"
            placeholder="Tên thư mục mới..."
            value={newDirName}
            onChange={e => setNewDirName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateDir(); if (e.key === 'Escape') setShowNewDir(false); }}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-text-secondary"
          />
          <button onClick={handleCreateDir} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">Tạo</button>
          <button onClick={() => setShowNewDir(false)} className="px-3 py-1 text-text-secondary text-xs hover:text-white transition-colors">Huỷ</button>
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        {/* File List */}
        <div className="flex-1 bg-bg-card border border-border-subtle rounded-xl overflow-hidden flex flex-col">
          {isError && (
            <div className="flex items-center gap-2 p-4 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không thể tải thư mục — path không hợp lệ hoặc ngoài whitelist.'}
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-bg-card">
                <tr className="border-b border-border-subtle text-sm text-text-secondary">
                  <th className="px-6 py-3 font-medium">Tên</th>
                  <th className="px-4 py-3 font-medium w-28">Kích thước</th>
                  <th className="px-4 py-3 font-medium w-36">Sửa đổi</th>
                  <th className="px-4 py-3 font-medium w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
                  </td></tr>
                )}
                {/* Nút back */}
                {!isLoading && currentPath !== DEFAULT_PATH && (
                  <tr className="border-b border-border-subtle/30 hover:bg-white/5 cursor-pointer"
                    onClick={() => {
                      const parts = currentPath.replace(/\\/g, '/').split('/');
                      parts.pop();
                      setCurrentPath(parts.join('/') || DEFAULT_PATH);
                    }}>
                    <td colSpan={4} className="px-6 py-3">
                      <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <ArrowLeft className="w-4 h-4" />
                        ..
                      </div>
                    </td>
                  </tr>
                )}
                {filteredEntries.map((entry, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-subtle/30 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleNavigate(entry)}
                      >
                        <FileIcon2 entry={entry} />
                        <span className="text-sm text-white group-hover:text-blue-400 transition-colors truncate max-w-xs">
                          {entry.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {entry.isDirectory ? '—' : fmtSize(entry.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{fmtDate(entry.modifiedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!entry.isDirectory && entry.size <= 1024 * 1024 && (
                          <button
                            onClick={() => setPreviewPath(entry.path.replace(/\\/g, '/'))}
                            className="p-1 hover:text-blue-400 text-text-secondary transition-colors rounded"
                            title="Xem nội dung"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!entry.isDirectory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadFile(entry.path);
                            }}
                            className="p-1 hover:text-green-400 text-text-secondary transition-colors rounded"
                            title="Tải xuống"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(entry.path)}
                          className="p-1 hover:text-red-400 text-text-secondary transition-colors rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredEntries.length === 0 && !isError && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-text-secondary text-sm">Thư mục trống</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Panel */}
        {previewPath && (
          <div className="w-96 bg-bg-card border border-border-subtle rounded-xl flex flex-col overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <span className="text-sm font-medium text-white truncate">{previewPath.split('/').pop()}</span>
              <button onClick={() => setPreviewPath(null)} className="text-text-secondary hover:text-white text-xs">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingContent ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto mt-8" />
              ) : (
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-5">
                  {fileContent?.content ?? ''}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <h3 className="text-white font-medium">Xác nhận xóa</h3>
            </div>
            <p className="text-text-secondary text-sm mb-6 break-all">
              Xóa: <span className="text-white">{confirmDelete.split('/').pop()}</span>?
              Hành động này không thể khôi phục.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-text-secondary hover:text-white border border-border-subtle rounded-lg transition-colors">
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
