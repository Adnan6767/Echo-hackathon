import { apiClient, isMockModeEnabled } from './client';
import { ENDPOINTS } from './endpoints';
import { computeDashboardSummary } from '../mocks/store';
import type { DashboardSummary } from '../types';

export async function fetchAnalyticsSummary(days: 7 | 14 = 14): Promise<DashboardSummary> {
  if (isMockModeEnabled()) {
    return computeDashboardSummary(days);
  }
  const response = await apiClient.get<DashboardSummary>(ENDPOINTS.analytics.summary, {
    params: { days },
  });
  return { ...response.data, source: 'live' };
}
