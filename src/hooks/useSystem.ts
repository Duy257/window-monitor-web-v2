import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { POLL, HISTORY_MAX_POINTS } from '../config';
import type {
  SystemOverview,
  CpuDetail,
  MemoryDetail,
  DiskPartition,
  NetworkDetail,
  ProcessList,
  MetricsHistoryRow,
} from '../types/api';

/** Snapshot tổng hợp tất cả metrics */
export function useSystemOverview() {
  return useQuery<SystemOverview>({
    queryKey: ['system', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/system/overview');
      return data.data;
    },
    refetchInterval: POLL.SYSTEM_OVERVIEW,
    staleTime: POLL.SYSTEM_OVERVIEW - 1000,
  });
}

/** Chi tiết CPU */
export function useCpuDetail() {
  return useQuery<CpuDetail>({
    queryKey: ['system', 'cpu'],
    queryFn: async () => {
      const { data } = await apiClient.get('/system/cpu');
      return data.data;
    },
    refetchInterval: POLL.CPU,
    staleTime: POLL.CPU - 500,
  });
}

/** Chi tiết RAM */
export function useMemoryDetail() {
  return useQuery<MemoryDetail>({
    queryKey: ['system', 'memory'],
    queryFn: async () => {
      const { data } = await apiClient.get('/system/memory');
      return data.data;
    },
    refetchInterval: POLL.MEMORY,
    staleTime: POLL.MEMORY - 500,
  });
}

/** Tất cả disk partitions */
export function useDiskDetail() {
  return useQuery<DiskPartition[]>({
    queryKey: ['system', 'disk'],
    queryFn: async () => {
      const { data } = await apiClient.get('/system/disk');
      return data.data;
    },
    refetchInterval: POLL.DISK,
    staleTime: POLL.DISK - 2000,
  });
}

/** Chi tiết network (interfaces + traffic) */
export function useNetworkDetail() {
  return useQuery<NetworkDetail>({
    queryKey: ['system', 'network'],
    queryFn: async () => {
      const { data } = await apiClient.get('/system/network');
      return data.data;
    },
    refetchInterval: POLL.NETWORK,
    staleTime: POLL.NETWORK - 1000,
  });
}

/** Lịch sử metrics từ DB */
export function useSystemHistory(params?: { from?: string; to?: string; limit?: number }) {
  return useQuery<MetricsHistoryRow[]>({
    queryKey: ['system', 'history', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/system/history', { params });
      return data.data;
    },
    staleTime: 30000,
  });
}

/** Danh sách tất cả system processes */
export function useProcesses() {
  return useQuery<ProcessList>({
    queryKey: ['processes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/processes');
      return data.data;
    },
    refetchInterval: POLL.PROCESSES,
    staleTime: POLL.PROCESSES - 1000,
  });
}

/** Kill process theo PID */
export function useKillProcess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pid: number) => apiClient.delete(`/processes/${pid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

/**
 * Hook lưu rolling buffer dữ liệu lịch sử biểu đồ realtime
 * Sử dụng functional setState để tránh tạo mảng thừa
 * maxPoints mặc định lấy từ HISTORY_MAX_POINTS trong config
 */
export function useRollingHistory(
  value: number | undefined,
  maxPoints: number = HISTORY_MAX_POINTS
) {
  const [history, setHistory] = useState<{ value: number }[]>([]);

  useEffect(() => {
    if (value === undefined) return;
    setHistory(prev => {
      const next = prev.length >= maxPoints
        ? [...prev.slice(1), { value }]
        : [...prev, { value }];
      return next;
    });
  }, [value, maxPoints]);

  return history;
}
