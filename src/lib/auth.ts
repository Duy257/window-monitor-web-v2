import { API_KEY } from '../config';

/**
 * Lấy API key từ localStorage (runtime) hoặc env (dev fallback)
 * Module dùng chung cho cả apiClient và socket
 */
export function getApiKey(): string {
  return localStorage.getItem('winmonitor_api_key') || API_KEY;
}
