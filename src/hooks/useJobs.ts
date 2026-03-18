import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { POLL } from "../api/config";
import type { CronJob, JobHistory, CreateJobPayload } from "../types/api";

/** Danh sách tất cả cron jobs */
export function useJobs() {
  return useQuery<CronJob[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/jobs");
      return data.data;
    },
    refetchInterval: POLL.JOBS,
    staleTime: POLL.JOBS - 5000,
  });
}

/** Lịch sử chạy của một job */
export function useJobHistory(jobId: number | null) {
  return useQuery<JobHistory[]>({
    queryKey: ["jobs", jobId, "history"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${jobId}/history`);
      return data.data;
    },
    enabled: jobId !== null,
    staleTime: 10000,
  });
}

/** Tạo job mới */
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobPayload) => apiClient.post("/jobs", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

/** Cập nhật job */
export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateJobPayload> & { enabled?: boolean };
    }) => apiClient.put(`/jobs/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

/** Xóa job */
export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

/** Chạy job ngay lập tức (manual trigger) */
export function useRunJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/jobs/${id}/run`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["jobs", id, "history"] });
    },
  });
}

/** Toggle enable/disable job */
export function useToggleJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/jobs/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}
