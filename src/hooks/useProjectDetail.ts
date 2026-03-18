import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { queryKeys } from "../api/queryKeys";
import { POLL } from "../api/config";
import type { Project, DeployLog, Pm2App } from "../types/api";

/** Lấy chi tiết 1 project theo name */
export function useProject(name: string | undefined) {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(name),
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${name}`);
      return data.data;
    },
    enabled: !!name,
    staleTime: POLL.PM2 - 1000,
  });
}

/** Lấy trạng thái project (running/stopped/error) */
export function useProjectStatus(name: string | undefined) {
  return useQuery<{ status: string }>({
    queryKey: queryKeys.projects.status(name),
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${name}/status`);
      return data.data;
    },
    enabled: !!name,
    refetchInterval: POLL.PM2,
    staleTime: POLL.PM2 - 1000,
  });
}

/** Lịch sử deploy của project */
export function useProjectDeploys(name: string | undefined) {
  return useQuery<DeployLog[]>({
    queryKey: queryKeys.projects.deploys(name),
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${name}/deploys`);
      return data.data;
    },
    enabled: !!name,
    staleTime: 10000,
  });
}

/** Trigger deploy project */
export function useDeployProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post(`/projects/${name}/deploy`);
      return data;
    },
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.deploys(name),
      });
    },
  });
}

/** Xóa project */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.delete(`/projects/${name}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

/** Lấy thông tin PM2 app cho project cụ thể */
export function useProjectPm2(name: string | undefined) {
  return useQuery<Pm2App | undefined>({
    queryKey: queryKeys.pm2.app(name),
    queryFn: async () => {
      const { data } = await apiClient.get("/pm2/apps");
      const apps: Pm2App[] = data.data;
      return apps.find((a) => a.name === name);
    },
    enabled: !!name,
    refetchInterval: POLL.PM2,
    staleTime: POLL.PM2 - 1000,
  });
}

/** Restart PM2 app */
export function useRestartPm2App() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post(`/pm2/apps/${name}/restart`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pm2.apps() });
    },
  });
}

/** Stop PM2 app */
export function useStopPm2App() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post(`/pm2/apps/${name}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pm2.apps() });
    },
  });
}

/** Reload PM2 app */
export function useReloadPm2App() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post(`/pm2/apps/${name}/reload`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pm2.apps() });
    },
  });
}

/** Flush logs PM2 app */
export function useFlushPm2Logs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post(`/pm2/apps/${name}/flush`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pm2.apps() });
    },
  });
}
