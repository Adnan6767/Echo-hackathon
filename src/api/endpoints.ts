/**
 * Proposed ECHO Python backend API routes.
 * Easily adjustable once backend routes are finalized.
 */
export const ENDPOINTS = {
  audio: {
    upload: '/audio/upload',
    transcribe: '/audio/transcribe',
  },
  orders: {
    extract: '/orders/extract',
    list: '/orders',
    create: '/orders',
    detail: (id: string) => `/orders/${encodeURIComponent(id)}`,
    updateStatus: (id: string) => `/orders/${encodeURIComponent(id)}/status`,
  },
  customers: {
    list: '/customers',
    ledger: (id: string) => `/customers/${encodeURIComponent(id)}/ledger`,
    addTransaction: (id: string) => `/customers/${encodeURIComponent(id)}/transactions`,
  },
  analytics: {
    summary: '/analytics/summary',
  },
  reviewQueue: {
    list: '/review-queue',
  },
} as const;
