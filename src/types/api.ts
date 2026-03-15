// Kiểu dữ liệu dùng chung cho toàn bộ API responses

/** Wrapper chuẩn của server */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── System ───────────────────────────────────────────────────────────────────

export interface CpuOverview {
  usage: number;
  cores: number;
  cpuPerCore: number[];
}

export interface MemoryOverview {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
  swapTotal: number;
  swapUsed: number;
}

export interface DiskPartition {
  fs: string;
  type: string;
  size: number;
  used: number;
  available: number;
  usagePercent: number;
  mount: string;
}

export interface NetworkTraffic {
  iface: string;
  rxBytes: number;
  txBytes: number;
  rxSec: number | null;
  txSec: number | null;
}

export interface OsInfo {
  hostname: string;
  platform: string;
  distro: string;
  release: string;
  arch: string;
}

export interface SystemOverview {
  cpu: CpuOverview;
  memory: MemoryOverview;
  disk: DiskPartition[];
  network: NetworkTraffic[];
  os: OsInfo;
  uptime: number;
  timestamp: string;
}

export interface CpuDetail {
  brand: string;
  manufacturer: string;
  speed: number;
  cores: number;
  physicalCores: number;
  usage: number;
  perCore: number[];
  temperature: number | null;
}

export interface MemoryDetail {
  total: number;
  used: number;
  free: number;
  active: number;
  available: number;
  usagePercent: number;
  swapTotal: number;
  swapUsed: number;
  swapFree: number;
}

export interface NetworkInterface {
  iface: string;
  ip4: string;
  ip6: string;
  mac: string;
  type: string;
  speed: number | null;
}

export interface NetworkTrafficDetail {
  iface: string;
  rxBytes: number;
  txBytes: number;
  rxSec: number | null;
  txSec: number | null;
  rxErrors: number;
  txErrors: number;
}

export interface NetworkDetail {
  interfaces: NetworkInterface[];
  traffic: NetworkTrafficDetail[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  memRss: number;
  state: string;
  started: string;
  command: string;
}

export interface ProcessList {
  total: number;
  running: number;
  list: ProcessInfo[];
}

export interface MetricsHistoryRow {
  id: number;
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
  net_rx: number;
  net_tx: number;
  recorded_at: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  display_name: string;
  path: string;
  repo_url: string | null;
  branch: string;
  install_command: string;
  build_command: string | null;
  start_command: string | null;
  health_url: string | null;
  health_timeout: number;
  env_path: string | null;
  port: number | null;
  status: string | null;
  notify_on_deploy: number;
  created_at: string;
  updated_at: string;
}

export interface DeployLog {
  id: number;
  project_id: number;
  status: "running" | "success" | "failed";
  output: string | null;
  error: string | null;
  duration_ms: number | null;
  started_at: string;
  finished_at: string | null;
  api_key_id: string | null;
}

export interface CreateProjectPayload {
  name: string;
  displayName?: string;
  path: string;
  repoUrl?: string;
  branch?: string;
  installCommand?: string;
  buildCommand?: string;
  startCommand?: string;
  healthUrl?: string;
  healthTimeout?: number;
  envPath?: string;
  port?: number;
  notifyOnDeploy?: boolean;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertMetric =
  | "cpu_usage"
  | "ram_usage"
  | "disk_usage"
  | "net_error"
  | "process_down";
export type AlertOperator = "gt" | "lt" | "gte" | "lte";

export interface AlertRule {
  id: number;
  name: string;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  duration_seconds: number;
  channels: string; // JSON string của mảng
  cooldown_seconds: number;
  enabled: number; // 0 | 1
  created_at: string;
}

export interface AlertLog {
  id: number;
  rule_id: number;
  message: string;
  value: number;
  channel: string;
  sent_at: string | null;
  created_at: string;
}

export interface AlertChannels {
  telegram: { configured: boolean };
  email: { configured: boolean };
  slack: { configured: boolean };
  discord: { configured: boolean };
}

export interface CreateAlertRulePayload {
  name: string;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  durationSeconds?: number;
  channels?: string[];
  cooldownSeconds?: number;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export type JobType =
  | "command"
  | "http"
  | "deploy"
  | "cleanup"
  | "backup"
  | "script";

export interface CronJob {
  id: number;
  name: string;
  type: JobType;
  cron_expression: string;
  config: string; // JSON string
  enabled: number; // 0 | 1
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

export interface JobHistory {
  id: number;
  job_id: number;
  status: "success" | "failed" | "running";
  output: string | null;
  error: string | null;
  duration_ms: number | null;
  executed_at: string;
}

export interface CreateJobPayload {
  name: string;
  type: JobType;
  cronExpression: string;
  config?: Record<string, unknown>;
}

// ─── PM2 ──────────────────────────────────────────────────────────────────────

export interface Pm2App {
  name: string | undefined;
  pmId: number | undefined;
  status: string | undefined;
  cpu: number | undefined;
  memory: number | undefined;
  uptime: number | undefined;
  restarts: number | undefined;
  pid: number | undefined;
}

// ─── Exec ─────────────────────────────────────────────────────────────────────

export interface ExecResult {
  command: string;
  args: string[];
  output: string;
  error: string;
  exitCode: number | null;
  durationMs: number;
}

export interface CommandWhitelistEntry {
  id: number;
  command: string;
  description: string | null;
}

export interface CommandLog {
  id: number;
  command: string;
  args: string; // JSON
  output: string | null;
  exit_code: number | null;
  api_key_id: string | null;
  duration_ms: number | null;
  executed_at: string;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  permissions: string; // JSON string của mảng
  last_used_at: string | null;
  created_at: string;
  is_active: number;
}
