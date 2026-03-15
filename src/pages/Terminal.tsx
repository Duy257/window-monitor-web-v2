import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { Plus, Trash2, Terminal as TerminalIcon, AlertCircle } from 'lucide-react';
import { useRunCommand } from '../hooks/useExec';

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'info';
  text: string;
}

let lineIdCounter = 0;

const WELCOME: TerminalLine[] = [
  { id: lineIdCounter++, type: 'info', text: '╔══════════════════════════════════════════╗' },
  { id: lineIdCounter++, type: 'info', text: '║         WinMonitor Remote Terminal       ║' },
  { id: lineIdCounter++, type: 'info', text: '╚══════════════════════════════════════════╝' },
  { id: lineIdCounter++, type: 'info', text: '⚡ Lệnh được thực thi qua /api/exec/run' },
  { id: lineIdCounter++, type: 'info', text: '📋 Chỉ các lệnh trong whitelist được phép.' },
  { id: lineIdCounter++, type: 'info', text: '' },
];

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'powershell' | 'bash'>('powershell');

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: runCommand, isPending } = useRunCommand();

  // Cuộn xuống cuối khi có line mới
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const appendLine = useCallback((type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { id: lineIdCounter++, type, text }]);
  }, []);

  const handleClear = () => {
    setLines(WELCOME);
  };

  const handleRun = useCallback(async () => {
    const raw = inputValue.trim();
    if (!raw) return;

    // Tách command và args
    const parts = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const command = parts[0] ?? '';
    const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

    appendLine('input', `> ${raw}`);
    setHistory(prev => [raw, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    setInputValue('');

    try {
      const result = await runCommand({ command, args });
      if (result.output) {
        result.output.split('\n').forEach(line => appendLine('output', line));
      }
      if (result.error) {
        result.error.split('\n').forEach(line => appendLine('error', line));
      }
      appendLine('info', `✓ Exit code: ${result.exitCode} | ${result.durationMs}ms`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr.response?.data?.message || axiosErr.message || 'Lỗi không xác định';
      appendLine('error', `✗ ${msg}`);
    }
    appendLine('info', '');
  }, [inputValue, appendLine, runCommand]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRun();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIndex(i => {
        const next = Math.min(i + 1, history.length - 1);
        setInputValue(history[next] ?? '');
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex(i => {
        const next = Math.max(i - 1, -1);
        setInputValue(next >= 0 ? history[next] : '');
        return next;
      });
    }
  };

  const getLineClass = (type: TerminalLine['type']): string => {
    switch (type) {
      case 'input': return 'text-green-400 font-bold';
      case 'error': return 'text-red-400';
      case 'info': return 'text-slate-500';
      default: return 'text-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
      {/* Terminal Header Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-main px-2">
        <div className="flex">
          {(['powershell', 'bash'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'powershell' ? 'PowerShell' : 'Bash'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-4">
          {isPending && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-400">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              Đang chạy...
            </div>
          )}
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Plus className="w-4 h-4" />
            New Tab
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        className="flex-1 p-4 bg-[#0d1117] font-mono text-sm overflow-y-auto cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-0.5 min-h-full">
          {lines.map(line => (
            <div key={line.id} className={`leading-5 whitespace-pre-wrap break-all ${getLineClass(line.type)}`}>
              {line.text}
            </div>
          ))}
        </div>
        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-border-subtle bg-[#0d1117] px-4 py-3 flex items-center gap-3">
        <TerminalIcon className="w-4 h-4 text-green-400 shrink-0" />
        <div className="flex items-center gap-2 flex-1 text-sm font-mono">
          <span className="text-green-400 shrink-0">
            {activeTab === 'powershell' ? 'PS>' : '$'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập lệnh... (Enter để chạy)"
            disabled={isPending}
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 outline-none disabled:opacity-50"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {inputValue && !isPending && (
          <button
            onClick={handleRun}
            className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/30 hover:bg-green-600/40 transition-colors"
          >
            Run
          </button>
        )}
      </div>

      {/* Warning về whitelist */}
      <div className="px-4 py-1.5 bg-yellow-900/20 border-t border-yellow-800/30 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
        <span className="text-xs text-yellow-500/80">Chỉ các lệnh trong whitelist được phép. Cần quyền exec.</span>
      </div>
    </div>
  );
}
