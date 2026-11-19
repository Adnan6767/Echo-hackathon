import { apiClient, isMockModeEnabled } from './client';
import { ENDPOINTS } from './endpoints';
import {
  createOrderInStore,
  getMockState,
  resolveReviewItemInStore,
  updateOrderStatusInStore,
} from '../mocks/store';
import type { OrderRecord, OrderStatus, ReviewItem } from '../types';

export async function fetchOrders(): Promise<OrderRecord[]> {
  if (isMockModeEnabled()) {
    return getMockState().orders;
  }
  const response = await apiClient.get<OrderRecord[]>(ENDPOINTS.orders.list);
  return response.data.map((o) => ({ ...o, source: 'live' }));
}

export async function fetchOrderById(id: string): Promise<OrderRecord | null> {
  if (isMockModeEnabled()) {
    return getMockState().orders.find((o) => o.id === id) ?? null;
  }
  const response = await apiClient.get<OrderRecord>(ENDPOINTS.orders.detail(id));
  return { ...response.data, source: 'live' };
}

export async function createOrder(
  payload: Omit<OrderRecord, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline'>
): Promise<OrderRecord> {
  if (isMockModeEnabled()) {
    return createOrderInStore(payload);
  }
  const response = await apiClient.post<OrderRecord>(ENDPOINTS.orders.create, payload);
  return { ...response.data, source: 'live' };
}

export async function patchOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  if (isMockModeEnabled()) {
    return updateOrderStatusInStore(orderId, status);
  }
  const response = await apiClient.patch<OrderRecord>(ENDPOINTS.orders.updateStatus(orderId), {
    status,
  });
  return { ...response.data, source: 'live' };
}

export async function fetchReviewQueue(): Promise<ReviewItem[]> {
  if (isMockModeEnabled()) {
    return getMockState().reviewQueue;
  }
  const response = await apiClient.get<ReviewItem[]>(ENDPOINTS.reviewQueue.list);
  return response.data.map((r) => ({ ...r, source: 'live' }));
}

export async function resolveReviewItem(
  reviewId: string,
  action: 'confirm' | 'reject',
  editedPayload?: {
    customerName: string;
    customerPhone?: string;
    items: ReviewItem['extractedItems'];
    paymentMode: ReviewItem['paymentMode'];
    deliveryInstructions?: string;
  }
): Promise<OrderRecord | null> {
  if (isMockModeEnabled()) {
    return resolveReviewItemInStore(reviewId, action, editedPayload);
  }
  const response = await apiClient.post<OrderRecord | null>(
    `${ENDPOINTS.reviewQueue.list}/${encodeURIComponent(reviewId)}/${action}`,
    editedPayload
  );
  return response.data;
}
