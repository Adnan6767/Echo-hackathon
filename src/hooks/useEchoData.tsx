import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getMockState,
  subscribeMockStore,
  updateSettingsInStore,
  resetMockStore,
} from '../mocks/store';
import {
  isMockModeEnabled,
  setMockModeEnabled,
  subscribeApiMode,
  formatApiError,
} from '../api/client';
import { fetchOrders, fetchReviewQueue } from '../api/orders.api';
import { fetchCustomers } from '../api/customers.api';
import { fetchAnalyticsSummary } from '../api/analytics.api';
import type {
  BusinessSettings,
  Customer,
  DashboardSummary,
  OrderRecord,
  ReviewItem,
} from '../types';

export function useApiMode() {
  const isMock = useSyncExternalStore(subscribeApiMode, isMockModeEnabled, isMockModeEnabled);
  return {
    isMockMode: isMock,
    setMockMode: setMockModeEnabled,
  };
}

export function useEchoSettings(): [BusinessSettings, (next: BusinessSettings) => void] {
  const store = useSyncExternalStore(subscribeMockStore, getMockState, getMockState);
  return [store.settings, updateSettingsInStore];
}

export function useEchoDashboardData(daysRange: 7 | 14 = 14) {
  const { isMockMode } = useApiMode();
  const mockStore = useSyncExternalStore(subscribeMockStore, getMockState, getMockState);

  const [orders, setOrders] = useState<OrderRecord[]>(mockStore.orders);
  const [customers, setCustomers] = useState<Customer[]>(mockStore.customers);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>(mockStore.reviewQueue);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchOrders(),
      fetchCustomers(),
      fetchReviewQueue(),
      fetchAnalyticsSummary(daysRange),
    ])
      .then(([ord, cust, rev, sum]) => {
        if (!active) return;
        setOrders(ord);
        setCustomers(cust);
        setReviewQueue(rev);
        setSummary(sum);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(formatApiError(err));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isMockMode, mockStore, daysRange]);

  return {
    orders,
    customers,
    reviewQueue,
    summary,
    loading,
    error,
    isMockMode,
    resetDemoData: resetMockStore,
  };
}
