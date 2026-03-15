import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket";

export type TerminalShell = "powershell" | "cmd";

interface TerminalCreatePayload {
  requestId: string;
  projectName: string;
  cwd: string;
  shell: TerminalShell;
  cols: number;
  rows: number;
}

interface TerminalSessionSummary {
  sessionId: string;
  projectName: string;
  cwd: string;
  shell: TerminalShell;
  cols: number;
  rows: number;
  createdAt: string;
  lastActiveAt: string;
  attachedSockets: number;
}

interface TerminalCreatedEvent {
  requestId?: string;
  sessionId: string;
  projectName: string;
  cwd: string;
  shell: TerminalShell;
  cols: number;
  rows: number;
}

interface TerminalDataEvent {
  sessionId: string;
  data: string;
}

interface TerminalStatusEvent {
  sessionId: string;
  status: "created" | "attached" | "detached" | "closed";
}

interface TerminalClosedEvent {
  sessionId: string;
  reason: string;
}

interface TerminalErrorEvent {
  action?: string;
  message: string;
  sessionId?: string;
}

interface TerminalListEvent {
  sessions: TerminalSessionSummary[];
}

interface UseTerminalSessionOptions {
  projectName: string;
  projectPath: string;
  shell?: TerminalShell;
  onData?: (data: string) => void;
  onError?: (message: string) => void;
  onClosed?: (reason: string) => void;
}

export function useTerminalSession({
  projectName,
  projectPath,
  shell = "powershell",
  onData,
  onError,
  onClosed,
}: UseTerminalSessionOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "creating" | "ready" | "closed"
  >("idle");
  const [sessions, setSessions] = useState<TerminalSessionSummary[]>([]);

  const activeSessionRef = useRef<string | null>(null);
  const pendingRequestRef = useRef<string | null>(null);

  useEffect(() => {
    activeSessionRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const onCreatedEvent = (payload: TerminalCreatedEvent) => {
      if (
        pendingRequestRef.current &&
        payload.requestId !== pendingRequestRef.current
      ) {
        return;
      }

      pendingRequestRef.current = null;
      setSessionId(payload.sessionId);
      setStatus("ready");
    };

    const onDataEvent = (payload: TerminalDataEvent) => {
      if (
        !activeSessionRef.current ||
        payload.sessionId !== activeSessionRef.current
      )
        return;
      onData?.(payload.data);
    };

    const onStatusEvent = (payload: TerminalStatusEvent) => {
      if (
        !activeSessionRef.current ||
        payload.sessionId !== activeSessionRef.current
      )
        return;
      if (payload.status === "closed") {
        setStatus("closed");
      }
    };

    const onClosedEvent = (payload: TerminalClosedEvent) => {
      if (
        !activeSessionRef.current ||
        payload.sessionId !== activeSessionRef.current
      )
        return;
      setStatus("closed");
      setSessionId(null);
      onClosed?.(payload.reason);
    };

    const onErrorEvent = (payload: TerminalErrorEvent) => {
      if (
        payload.sessionId &&
        activeSessionRef.current &&
        payload.sessionId !== activeSessionRef.current
      ) {
        return;
      }

      if (status === "creating") {
        setStatus("idle");
      }
      onError?.(payload.message);
    };

    const onListEvent = (payload: TerminalListEvent) => {
      setSessions(payload.sessions || []);
    };

    socket.on("terminal:created", onCreatedEvent);
    socket.on("terminal:data", onDataEvent);
    socket.on("terminal:status", onStatusEvent);
    socket.on("terminal:closed", onClosedEvent);
    socket.on("terminal:error", onErrorEvent);
    socket.on("terminal:list", onListEvent);

    socket.emit("terminal:list");

    return () => {
      socket.off("terminal:created", onCreatedEvent);
      socket.off("terminal:data", onDataEvent);
      socket.off("terminal:status", onStatusEvent);
      socket.off("terminal:closed", onClosedEvent);
      socket.off("terminal:error", onErrorEvent);
      socket.off("terminal:list", onListEvent);
    };
  }, [onClosed, onData, onError, status]);

  const createSession = useCallback(
    (cols: number, rows: number) => {
      const requestId = crypto.randomUUID();
      pendingRequestRef.current = requestId;
      setStatus("creating");

      const payload: TerminalCreatePayload = {
        requestId,
        projectName,
        cwd: projectPath,
        shell,
        cols,
        rows,
      };

      socket.emit("terminal:create", payload);
    },
    [projectName, projectPath, shell],
  );

  const attachSession = useCallback((targetSessionId: string) => {
    setSessionId(targetSessionId);
    setStatus("ready");
    socket.emit("terminal:attach", { sessionId: targetSessionId });
  }, []);

  const sendInput = useCallback(
    (data: string) => {
      if (!activeSessionRef.current || status !== "ready") return;
      socket.emit("terminal:input", {
        sessionId: activeSessionRef.current,
        data,
      });
    },
    [status],
  );

  const resizeSession = useCallback(
    (cols: number, rows: number) => {
      if (!activeSessionRef.current || status !== "ready") return;
      socket.emit("terminal:resize", {
        sessionId: activeSessionRef.current,
        cols,
        rows,
      });
    },
    [status],
  );

  const closeSession = useCallback(() => {
    if (!activeSessionRef.current) return;
    socket.emit("terminal:close", { sessionId: activeSessionRef.current });
  }, []);

  const refreshSessions = useCallback(() => {
    socket.emit("terminal:list");
  }, []);

  return {
    sessionId,
    status,
    sessions,
    createSession,
    attachSession,
    sendInput,
    resizeSession,
    closeSession,
    refreshSessions,
  };
}
