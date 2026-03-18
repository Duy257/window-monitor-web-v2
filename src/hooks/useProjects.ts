import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { queryKeys } from "../api/queryKeys";
import type { Project, DeployLog, CreateProjectPayload } from "../types/api";

/** Danh sách tất cả projects */
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: queryKeys.projects.all(),
    queryFn: async () => {
      const { data } = await apiClient.get("/projects");
      return data.data;
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

/** Chi tiết 1 project theo name */
export function useProject(name: string) {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(name),
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${name}`);
      return data.data;
    },
    enabled: !!name,
  });
}

/** Lịch sử deploy của project */
export function useProjectDeploys(name: string) {
  return useQuery<DeployLog[]>({
    queryKey: queryKeys.projects.deploys(name),
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${name}/deploys`);
      return data.data;
    },
    enabled: !!name,
  });
}

/** Tạo project mới (cần quyền admin) */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      apiClient.post("/projects", payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
}

/** Cập nhật project (cần quyền admin) */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      payload,
    }: {
      name: string;
      payload: Partial<CreateProjectPayload>;
    }) => apiClient.put(`/projects/${name}`, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
}

/** Xóa project (cần quyền admin) */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.delete(`/projects/${name}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
}

/** Trigger deploy (cần quyền deploy) */
export function useDeployProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post(`/projects/${name}/deploy`),
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.deploys(name),
      });
    },
  });
}
