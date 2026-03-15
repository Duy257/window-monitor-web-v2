import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { POLL } from '../config';
import type { Pm2App } from '../types/api';

/** Danh sách PM2 managed apps, polling 5 giây */
export function usePm2Apps() {
  return useQuery<Pm2App[]>({
    queryKey: ['pm2', 'apps'],
    queryFn: async () => {
      const { data } = await apiClient.get('/pm2/apps');
      return data.data;
    },
    refetchInterval: POLL.PM2,
    staleTime: POLL.PM2 - 1000,
  });
}

/** Restart PM2 app (cần quyền deploy) */
export function useRestartApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) => apiClient.post(`/pm2/apps/${appName}/restart`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pm2'] }),
  });
}

/** Reload PM2 app (zero-downtime) */
export function useReloadApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) => apiClient.post(`/pm2/apps/${appName}/reload`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pm2'] }),
  });
}

/** Stop PM2 app */
export function useStopApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) => apiClient.post(`/pm2/apps/${appName}/stop`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pm2'] }),
  });
}

/** Flush logs PM2 app (cần quyền admin) */
export function useFlushApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) => apiClient.post(`/pm2/apps/${appName}/flush`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pm2'] }),
  });
}
