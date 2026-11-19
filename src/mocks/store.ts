import {
  INITIAL_CUSTOMERS,
  INITIAL_DAILY_SERIES,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_ORDERS,
  INITIAL_REVIEW_QUEUE,
  INITIAL_SETTINGS,
} from './data';
import type {
  BusinessSettings,
  Customer,
  DashboardSummary,
  LedgerEntry,
  OrderRecord,
  OrderStatus,
  ReviewItem,
} from '../types';

const STORAGE_KEY = 'echo_demo_store_v1';

export interface EchoMockState {
  orders: OrderRecord[];
  customers: Customer[];
  ledgerEntries: LedgerEntry[];
  reviewQueue: ReviewItem[];
  settings: BusinessSettings;
}

function getInitialState(): EchoMockState {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<EchoMockState>;
        if (parsed.orders && parsed.customers && parsed.ledgerEntries && parsed.reviewQueue && parsed.settings) {
          return parsed as EchoMockState;
        }
      }
    } catch {
      // Ignore storage errors and fall back to fresh seed
    }
  }

  return {
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    ledgerEntries: INITIAL_LEDGER_ENTRIES,
    reviewQueue: INITIAL_REVIEW_QUEUE,
    settings: INITIAL_SETTINGS,
  };
}

let state: EchoMockState = getInitialState();
const listeners = new Set<() => void>();

function persistAndNotify() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }
  listeners.forEach((fn) => fn());
}

export function subscribeMockStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMockState(): EchoMockState {
  return state;
}

export function resetMockStore() {
  state = {
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    ledgerEntries: INITIAL_LEDGER_ENTRIES,
    reviewQueue: INITIAL_REVIEW_QUEUE,
    settings: INITIAL_SETTINGS,
  };
  persistAndNotify();
}

export function createOrderInStore(newOrder: Omit<OrderRecord, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): OrderRecord {
  const nextNum = 1043 + Math.max(0, state.orders.length - INITIAL_ORDERS.length);
  const now = new Date().toISOString();
  const orderNumber = `ORD-${nextNum}`;

  // Find or create customer
  let customer = state.customers.find(
    (c) => c.name.toLowerCase() === newOrder.customerName.trim().toLowerCase()
  );

  let updatedCustomers = [...state.customers];
  let updatedLedger = [...state.ledgerEntries];

  if (!customer) {
    customer = {
      id: `cust-${Date.now()}`,
      name: newOrder.customerName.trim(),
      phone: newOrder.customerPhone?.trim() || '',
      address: newOrder.deliveryInstructions || 'Local Neighborhood Delivery',
      totalPurchasesInr: newOrder.totalAmountInr,
      amountPaidInr: newOrder.paymentMode === 'udhaar' ? 0 : newOrder.totalAmountInr,
      outstandingBalanceInr: newOrder.paymentMode === 'udhaar' ? newOrder.totalAmountInr : 0,
      lastTransactionAt: now,
      orderCount: 1,
      source: 'demo',
    };
    updatedCustomers = [customer, ...updatedCustomers];
  } else {
    const isUdhaar = newOrder.paymentMode === 'udhaar';
    const nextBalance = customer.outstandingBalanceInr + (isUdhaar ? newOrder.totalAmountInr : 0);
    customer = {
      ...customer,
      totalPurchasesInr: customer.totalPurchasesInr + newOrder.totalAmountInr,
      amountPaidInr: customer.amountPaidInr + (isUdhaar ? 0 : newOrder.totalAmountInr),
      outstandingBalanceInr: nextBalance,
      lastTransactionAt: now,
      orderCount: customer.orderCount + 1,
    };
    updatedCustomers = updatedCustomers.map((c) => (c.id === customer!.id ? customer! : c));
  }

  if (newOrder.paymentMode === 'udhaar' && newOrder.totalAmountInr > 0) {
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      customerId: customer.id,
      type: 'credit',
      amountInr: newOrder.totalAmountInr,
      runningBalanceInr: customer.outstandingBalanceInr,
      timestamp: now,
      referenceOrderNumber: orderNumber,
      paymentChannel: 'voice_order',
      note: `Voice order ${orderNumber}: ${newOrder.items.map((i) => `${i.quantity ?? '?'} ${i.unit} ${i.productName}`).join(', ')}`,
      recordedBy: state.settings.ownerName,
      immutableHash: `LED-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      source: 'demo',
    };
    updatedLedger = [...updatedLedger, ledgerEntry];
  }

  const record: OrderRecord = {
    ...newOrder,
    id: `ord-${Date.now()}`,
    orderNumber,
    customerId: customer.id,
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        id: `tl-1-${Date.now()}`,
        label: 'Voice note processed (Demo Mode)',
        timestamp: now,
        actor: 'ECHO Demo Pipeline',
        detail: `${newOrder.audioDurationSec}s ${newOrder.language}`,
      },
      {
        id: `tl-2-${Date.now()}`,
        label: 'Order confirmed & recorded',
        timestamp: now,
        actor: state.settings.ownerName,
        detail:
          newOrder.paymentMode === 'udhaar'
            ? `Recorded ₹${newOrder.totalAmountInr} to customer udhaar ledger`
            : `Payment mode: ${newOrder.paymentMode.toUpperCase()}`,
      },
    ],
  };

  state = {
    ...state,
    orders: [record, ...state.orders],
    customers: updatedCustomers,
    ledgerEntries: updatedLedger,
  };
  persistAndNotify();
  return record;
}

export function updateOrderStatusInStore(orderId: string, nextStatus: OrderStatus): OrderRecord | null {
  const target = state.orders.find((o) => o.id === orderId);
  if (!target) return null;

  const now = new Date().toISOString();
  const statusLabels: Record<OrderStatus, string> = {
    received: 'Received',
    needs_confirmation: 'Needs confirmation',
    packed: 'Packed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const updated: OrderRecord = {
    ...target,
    status: nextStatus,
    updatedAt: now,
    timeline: [
      ...target.timeline,
      {
        id: `tl-${Date.now()}`,
        label: `Status changed to ${statusLabels[nextStatus]}`,
        timestamp: now,
        actor: state.settings.ownerName,
      },
    ],
  };

  state = {
    ...state,
    orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
  };
  persistAndNotify();
  return updated;
}

export function addLedgerTransactionInStore(
  customerId: string,
  payload: {
    type: 'credit' | 'payment';
    amountInr: number;
    note: string;
    paymentChannel: 'cash' | 'upi' | 'manual_credit';
  }
): LedgerEntry | null {
  const customer = state.customers.find((c) => c.id === customerId);
  if (!customer) return null;

  const now = new Date().toISOString();
  const delta = payload.type === 'credit' ? payload.amountInr : -payload.amountInr;
  const nextBalance = Math.max(0, customer.outstandingBalanceInr + delta);

  const entry: LedgerEntry = {
    id: `led-${Date.now()}`,
    customerId,
    type: payload.type,
    amountInr: payload.amountInr,
    runningBalanceInr: nextBalance,
    timestamp: now,
    paymentChannel: payload.paymentChannel,
    note: payload.note.trim(),
    recordedBy: state.settings.ownerName,
    immutableHash: `LED-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    source: 'demo',
  };

  const updatedCustomer: Customer = {
    ...customer,
    totalPurchasesInr:
      payload.type === 'credit'
        ? customer.totalPurchasesInr + payload.amountInr
        : customer.totalPurchasesInr,
    amountPaidInr:
      payload.type === 'payment'
        ? customer.amountPaidInr + payload.amountInr
        : customer.amountPaidInr,
    outstandingBalanceInr: nextBalance,
    lastTransactionAt: now,
  };

  state = {
    ...state,
    customers: state.customers.map((c) => (c.id === customerId ? updatedCustomer : c)),
    ledgerEntries: [...state.ledgerEntries, entry],
  };
  persistAndNotify();
  return entry;
}

export function resolveReviewItemInStore(
  reviewId: string,
  action: 'confirm' | 'reject',
  editedPayload?: {
    customerName: string;
    customerPhone?: string;
    items: ReviewItem['extractedItems'];
    paymentMode: ReviewItem['paymentMode'];
    deliveryInstructions?: string;
  }
): OrderRecord | null {
  const item = state.reviewQueue.find((r) => r.id === reviewId);
  if (!item) return null;

  let created: OrderRecord | null = null;

  if (action === 'confirm') {
    const finalItems = (editedPayload?.items ?? item.extractedItems).map((it) => ({
      ...it,
      quantity: it.quantity ?? 1,
      needsReview: false,
      confidence: 1,
    }));
    const total = finalItems.reduce((sum, it) => sum + (it.quantity ?? 1) * (it.unitPriceInr ?? 0), 0);

    created = createOrderInStore({
      customerId: '',
      customerName: editedPayload?.customerName ?? item.customerName,
      customerPhone: editedPayload?.customerPhone?.trim() ?? '',
      items: finalItems,
      totalAmountInr: total,
      paymentMode: editedPayload?.paymentMode ?? item.paymentMode,
      status: 'received',
      audioDurationSec: item.audioDurationSec,
      audioFileName: item.audioFileName,
      transcription: item.transcription,
      language: item.language,
      deliveryInstructions: editedPayload?.deliveryInstructions ?? item.deliveryInstructions,
      overallConfidence: 1,
      source: 'demo',
    });
  }

  state = {
    ...state,
    reviewQueue: state.reviewQueue.filter((r) => r.id !== reviewId),
  };
  persistAndNotify();
  return created;
}

export function updateSettingsInStore(next: BusinessSettings) {
  state = {
    ...state,
    settings: next,
  };
  persistAndNotify();
}

export function computeDashboardSummary(daysRange: 7 | 14 = 14): DashboardSummary {
  const { orders, customers, reviewQueue, ledgerEntries } = state;

  const extraOrdersCount = Math.max(0, orders.length - INITIAL_ORDERS.length);
  const completedOrders = orders.filter((o) => o.status === 'delivered').length + 19;
  const pendingOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'packed' || o.status === 'needs_confirmation'
  ).length;
  const outstandingUdhaarInr = customers.reduce((sum, c) => sum + c.outstandingBalanceInr, 0);

  const extraSalesToday = orders
    .slice(0, extraOrdersCount)
    .reduce((sum, o) => sum + o.totalAmountInr, 0);
  const dailySalesInr = 11640 + extraSalesToday;
  const ordersToday = 28 + extraOrdersCount;

  const slicedSeries = INITIAL_DAILY_SERIES.slice(-daysRange).map((pt, idx, arr) =>
    idx === arr.length - 1
      ? { ...pt, orders: ordersToday, salesInr: dailySalesInr }
      : pt
  );

  // Aggregate top products from current orders + realistic baseline
  const productMap = new Map<string, { ordersCount: number; revenueInr: number; qty: number; unit: string }>();
  const baseline: { name: string; count: number; qty: number; unit: string; rev: number }[] = [
    { name: 'Aata (Wheat Flour)', count: 42, qty: 168, unit: 'kg', rev: 8064 },
    { name: 'Cooking Oil (Mustard & Sunflower)', count: 35, qty: 54, unit: 'litre', rev: 8420 },
    { name: 'Basmati Rice', count: 29, qty: 112, unit: 'kg', rev: 12544 },
    { name: 'Toor & Moong Dal', count: 26, qty: 38, unit: 'kg', rev: 6156 },
    { name: 'Amul Gold Milk', count: 48, qty: 84, unit: 'litre', rev: 5712 },
  ];
  baseline.forEach((b) =>
    productMap.set(b.name, { ordersCount: b.count, revenueInr: b.rev, qty: b.qty, unit: b.unit })
  );

  const topProducts = Array.from(productMap.entries())
    .map(([productName, v]) => ({
      productName,
      ordersCount: v.ordersCount,
      totalQuantityLabel: `${v.qty} ${v.unit}`,
      revenueInr: v.revenueInr,
    }))
    .sort((a, b) => b.revenueInr - a.revenueInr);

  const totalUdhaar = slicedSeries.reduce((s, d) => s + d.udhaarInr, 0);
  const totalUpi = slicedSeries.reduce((s, d) => s + d.upiInr, 0);
  const totalCash = slicedSeries.reduce((s, d) => s + d.cashInr, 0);
  const sumModes = totalUdhaar + totalUpi + totalCash || 1;

  const paymentDistribution = [
    { mode: 'UPI', value: Math.round((totalUpi / sumModes) * 100), amountInr: totalUpi, color: '#40C98A' },
    { mode: 'Udhaar (Credit)', value: Math.round((totalUdhaar / sumModes) * 100), amountInr: totalUdhaar, color: '#FF7139' },
    { mode: 'Cash', value: Math.round((totalCash / sumModes) * 100), amountInr: totalCash, color: '#E8B75B' },
  ];

  const recentActivity = [
    ...orders.slice(0, 3).map((o) => ({
      id: `act-${o.id}`,
      customerName: o.customerName,
      action: `Voice order ${o.orderNumber} (${o.items.length} items · ${o.paymentMode.toUpperCase()})`,
      amountInr: o.totalAmountInr,
      timestamp: o.createdAt,
      kind: 'order' as const,
    })),
    ...ledgerEntries
      .filter((e) => e.type === 'payment')
      .slice(-2)
      .reverse()
      .map((e) => {
        const cust = customers.find((c) => c.id === e.customerId);
        return {
          id: `act-${e.id}`,
          customerName: cust?.name ?? 'Customer',
          action: `Udhaar payment received (${e.paymentChannel?.toUpperCase() ?? 'CASH'})`,
          amountInr: e.amountInr,
          timestamp: e.timestamp,
          kind: 'payment' as const,
        };
      }),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    ordersToday,
    completedOrders,
    pendingOrders,
    needsReviewCount: reviewQueue.length,
    dailySalesInr,
    outstandingUdhaarInr,
    dailySeries: slicedSeries,
    topProducts,
    paymentDistribution,
    recentActivity,
    source: 'demo',
  };
}
