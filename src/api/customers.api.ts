import { apiClient, isMockModeEnabled } from './client';
import { ENDPOINTS } from './endpoints';
import { addLedgerTransactionInStore, getMockState } from '../mocks/store';
import type { Customer, LedgerEntry } from '../types';

export async function fetchCustomers(): Promise<Customer[]> {
  if (isMockModeEnabled()) {
    return getMockState().customers;
  }
  const response = await apiClient.get<Customer[]>(ENDPOINTS.customers.list);
  return response.data.map((c) => ({ ...c, source: 'live' }));
}

export async function fetchCustomerLedger(customerId: string): Promise<LedgerEntry[]> {
  if (isMockModeEnabled()) {
    return getMockState()
      .ledgerEntries.filter((e) => e.customerId === customerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  const response = await apiClient.get<LedgerEntry[]>(ENDPOINTS.customers.ledger(customerId));
  return response.data.map((e) => ({ ...e, source: 'live' }));
}

export async function addCustomerTransaction(
  customerId: string,
  payload: {
    type: 'credit' | 'payment';
    amountInr: number;
    note: string;
    paymentChannel: 'cash' | 'upi' | 'manual_credit';
  }
): Promise<LedgerEntry | null> {
  if (isMockModeEnabled()) {
    return addLedgerTransactionInStore(customerId, payload);
  }
  const response = await apiClient.post<LedgerEntry>(
    ENDPOINTS.customers.addTransaction(customerId),
    payload
  );
  return { ...response.data, source: 'live' };
}
