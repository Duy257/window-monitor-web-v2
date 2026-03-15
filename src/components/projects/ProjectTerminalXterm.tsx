import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AlertCircle, Link2Off, Loader2, PlugZap, TerminalSquare, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTerminalSession, type TerminalShell } from '../../hooks/useTerminalSession';
import 'xterm/css/xterm.css';

interface ProjectTerminalXtermProps {
  projectName: string;
  projectPath: string;
}

export function ProjectTerminalXterm({ projectName, projectPath }: ProjectTerminalXtermProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [shell, setShell] = useState<TerminalShell>('powershell');
  const [error, setError] = useState<string>('');

  const {
    sessionId,
    status,
    sessions,
    createSession,
    attachSession,
    sendInput,
    resizeSession,
    closeSession,
    refreshSessions,
  } = useTerminalSession({
    projectName,
    projectPath,
    shell,
    onData: (data) => {
      xtermRef.current?.write(data);
    },
    onError: (message) => setError(message),
    onClosed: (reason) => {
      xtermRef.current?.writeln(`\r\n[session closed: ${reason}]`);
    },
  });

  const sameProjectSessions = useMemo(
    () => sessions.filter((s) => s.projectName === projectName),
    [projectName, sessions]
  );

  const setupTerminal = useCallback(() => {
    if (!containerRef.current || xtermRef.current) return;

    const terminal = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#d4d4d4',
        cursor: '#58a6ff',
      },
      allowTransparency: false,
      scrollback: 2000,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    terminal.writeln(`WinMonitor Terminal — ${projectName}`);
    terminal.writeln(`Path: ${projectPath}`);
    terminal.writeln('');

    terminal.onData((data: string) => {
      sendInput(data);
    });

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;
  }, [projectName, projectPath, sendInput]);

  useEffect(() => {
    setupTerminal();
    const onResize = () => {
      if (!fitAddonRef.current || !xtermRef.current) return;
      fitAddonRef.current.fit();
      resizeSession(xtermRef.current.cols, xtermRef.current.rows);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [resizeSession, setupTerminal]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    if (!xtermRef.current) return;

    if (status === 'idle' && !sessionId) {
      const latest = sameProjectSessions[0];
      if (latest) {
        attachSession(latest.sessionId);
        xtermRef.current.writeln(`[attach] ${latest.sessionId}`);
      } else {
        createSession(xtermRef.current.cols, xtermRef.current.rows);
      }
    }
  }, [attachSession, createSession, sameProjectSessions, sessionId, status]);

  useEffect(() => {
    if (status === 'ready' && sessionId) {
      setError('');
      xtermRef.current?.writeln(`\r\n[ready] session=${sessionId}\r\n`);
    }
  }, [sessionId, status]);

  useEffect(() => {
    return () => {
      xtermRef.current?.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  const handleClose = () => {
    closeSession();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Terminal</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShell('powershell')}
            className={`px-2.5 py-1 rounded text-xs border ${
              shell === 'powershell'
                ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                : 'border-border-subtle text-text-secondary'
            }`}
          >
            PowerShell
          </button>
          <button
            type="button"
            onClick={() => setShell('cmd')}
            className={`px-2.5 py-1 rounded text-xs border ${
              shell === 'cmd'
                ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                : 'border-border-subtle text-text-secondary'
            }`}
          >
            CMD
          </button>
          <Button size="sm" variant="secondary" onClick={handleClose}>
            <X className="w-4 h-4" /> Close Session
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-text-secondary">
        {status === 'creating' && (
          <span className="inline-flex items-center gap-1 text-yellow-300"><Loader2 className="w-3 h-3 animate-spin" /> Creating session...</span>
        )}
        {status === 'ready' && (
          <span className="inline-flex items-center gap-1 text-green-300"><PlugZap className="w-3 h-3" /> Connected</span>
        )}
        {status === 'closed' && (
          <span className="inline-flex items-center gap-1 text-orange-300"><Link2Off className="w-3 h-3" /> Session closed</span>
        )}
        {status === 'idle' && (
          <span className="inline-flex items-center gap-1 text-text-secondary"><TerminalSquare className="w-3 h-3" /> Waiting for session</span>
        )}
        <span className="font-mono">{projectPath}</span>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm inline-flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="bg-bg-card border border-border-subtle rounded-xl p-3 h-[520px]">
        <div ref={containerRef} className="w-full h-full overflow-hidden rounded-md" />
      </div>
    </div>
  );
}
