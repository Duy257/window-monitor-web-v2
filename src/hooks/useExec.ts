import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type {
  ExecResult,
  CommandWhitelistEntry,
  CommandLog,
} from "../types/api";

/** Chạy lệnh shell (cần quyền exec) */
export function useRunCommand() {
  return useMutation({
    mutationFn: (payload: { command: string; args?: string[]; cwd?: string }) =>
      apiClient
        .post<{ data: ExecResult }>("/exec/run", payload)
        .then((r) => r.data.data),
  });
}

/** Danh sách lệnh trong whitelist */
export function useWhitelist() {
  return useQuery<CommandWhitelistEntry[]>({
    queryKey: ["exec", "whitelist"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/whitelist");
      return data.data;
    },
    staleTime: 60000,
  });
}

/** Lịch sử 100 lệnh đã chạy gần nhất */
export function useExecHistory() {
  return useQuery<CommandLog[]>({
    queryKey: ["exec", "history"],
    queryFn: async () => {
      const { data } = await apiClient.get("/exec/history");
      return data.data;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}
