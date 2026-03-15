import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { POLL } from '../config';
import type { AlertRule, AlertLog, AlertChannels, CreateAlertRulePayload } from '../types/api';

/** Danh sách alert rules */
export function useAlertRules() {
  return useQuery<AlertRule[]>({
    queryKey: ['alerts', 'rules'],
    queryFn: async () => {
      const { data } = await apiClient.get('/alerts/rules');
      return data.data;
    },
    refetchInterval: POLL.ALERTS * 2,
    staleTime: POLL.ALERTS,
  });
}

/** Lịch sử alert logs */
export function useAlertLogs(limit = 50) {
  return useQuery<AlertLog[]>({
    queryKey: ['alerts', 'logs', limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/alerts/logs', { params: { limit } });
      return data.data;
    },
    refetchInterval: POLL.ALERTS,
    staleTime: POLL.ALERTS - 5000,
  });
}

/** Trạng thái channels (Telegram, Email, Slack, Discord) */
export function useAlertChannels() {
  return useQuery<AlertChannels>({
    queryKey: ['alerts', 'channels'],
    queryFn: async () => {
      const { data } = await apiClient.get('/alerts/channels');
      return data.data;
    },
    staleTime: 60000,
  });
}

/** Tạo alert rule mới */
export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAlertRulePayload) => apiClient.post('/alerts/rules', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] }),
  });
}

/** Cập nhật alert rule */
export function useUpdateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateAlertRulePayload> & { enabled?: boolean } }) =>
      apiClient.put(`/alerts/rules/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] }),
  });
}

/** Xóa alert rule */
export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/alerts/rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] }),
  });
}

/** Toggle enable/disable alert rule */
export function useToggleAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/alerts/rules/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] }),
  });
}

/** Gửi test notification */
export function useTestAlert() {
  return useMutation({
    mutationFn: () => apiClient.post('/alerts/test'),
  });
}
