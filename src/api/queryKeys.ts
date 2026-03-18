export const queryKeys = {
  system: {
    overview: () => ["system", "overview"] as const,
    cpu: () => ["system", "cpu"] as const,
    memory: () => ["system", "memory"] as const,
    disk: () => ["system", "disk"] as const,
    network: () => ["system", "network"] as const,
    history: (params?: { from?: string; to?: string; limit?: number }) =>
      ["system", "history", params ?? {}] as const,
  },
  processes: {
    all: () => ["processes"] as const,
  },
  pm2: {
    apps: () => ["pm2", "apps"] as const,
    app: (name?: string) => ["pm2", "apps", name ?? ""] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    detail: (name?: string) => ["projects", name ?? ""] as const,
    status: (name?: string) => ["projects", name ?? "", "status"] as const,
    deploys: (name?: string) => ["projects", name ?? "", "deploys"] as const,
  },
  alerts: {
    rules: () => ["alerts", "rules"] as const,
    logs: (limit = 50) => ["alerts", "logs", limit] as const,
    channels: () => ["alerts", "channels"] as const,
  },
  jobs: {
    all: () => ["jobs"] as const,
    history: (jobId: number | null) =>
      ["jobs", jobId ?? "", "history"] as const,
  },
  files: {
    list: (path: string | null) => ["files", "list", path ?? ""] as const,
    read: (path: string | null) => ["files", "read", path ?? ""] as const,
    all: () => ["files"] as const,
  },
  exec: {
    whitelist: () => ["exec", "whitelist"] as const,
    history: () => ["exec", "history"] as const,
  },
} as const;
