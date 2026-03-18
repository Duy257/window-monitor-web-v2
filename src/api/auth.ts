import { API_KEY } from './config';

export function getApiKey(): string {
  return localStorage.getItem('winmonitor_api_key') || API_KEY;
}
