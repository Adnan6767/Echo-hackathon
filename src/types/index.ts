export type OrderStatus =
  | 'received'
  | 'needs_confirmation'
  | 'packed'
  | 'delivered'
  | 'cancelled';

export type PaymentMode = 'udhaar' | 'cash' | 'upi' | 'pending';

export type SupportedLanguage = 'hi-IN' | 'en-IN' | 'hinglish' | 'mr-IN' | 'gu-IN';

export type DataSourceMode = 'demo' | 'live';

export interface AudioUpload {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  durationSec: number;
  language: SupportedLanguage;
  uploadedAt: string;
  audioUrl?: string;
  source: DataSourceMode;
}

export interface Transcription {
  audioId: string;
  rawText: string;
  normalizedText: string;
  detectedLanguage: string;
  confidence: number; // 0 to 1
  durationSec: number;
  engine: string;
  source: DataSourceMode;
}

export interface OrderItem {
  id: string;
  productName: string;
  hindiAlias?: string;
  quantity: number | null;
  unit: string;
  unitPriceInr: number | null;
  confidence: number; // 0 to 1
  needsReview?: boolean;
  note?: string;
}

export interface ExtractedOrder {
  id: string;
  audioId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  paymentMode: PaymentMode;
  deliveryInstructions?: string;
  overallConfidence: number;
  missingFields: string[];
  warnings: string[];
  transcription: string;
  language: string;
  createdAt: string;
  source: DataSourceMode;
}

export interface OrderTimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  actor: string;
  detail?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmountInr: number;
  paymentMode: PaymentMode;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  audioDurationSec: number;
  audioFileName: string;
  transcription: string;
  language: string;
  deliveryInstructions?: string;
  overallConfidence: number;
  timeline: OrderTimelineEvent[];
  source: DataSourceMode;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchasesInr: number;
  amountPaidInr: number;
  outstandingBalanceInr: number;
  lastTransactionAt: string;
  orderCount: number;
  source: DataSourceMode;
}

export type LedgerEntryType = 'credit' | 'payment';

export interface LedgerEntry {
  id: string;
  customerId: string;
  type: LedgerEntryType;
  amountInr: number;
  runningBalanceInr: number;
  timestamp: string;
  referenceOrderNumber?: string;
  paymentChannel?: 'cash' | 'upi' | 'voice_order' | 'manual_credit';
  note: string;
  recordedBy: string;
  immutableHash: string;
  source: DataSourceMode;
}

export interface ReviewItem {
  id: string;
  audioFileName: string;
  audioDurationSec: number;
  receivedAt: string;
  customerName: string;
  customerPhone?: string;
  transcription: string;
  language: string;
  extractedItems: OrderItem[];
  paymentMode: PaymentMode;
  deliveryInstructions?: string;
  fieldsNeedingReview: string[];
  overallConfidence: number;
  reasonSummary: string;
  source: DataSourceMode;
}

export interface DailyMetricPoint {
  date: string;
  label: string;
  orders: number;
  salesInr: number;
  udhaarInr: number;
  upiInr: number;
  cashInr: number;
}

export interface TopProductMetric {
  productName: string;
  ordersCount: number;
  totalQuantityLabel: string;
  revenueInr: number;
}

export interface DashboardSummary {
  ordersToday: number;
  completedOrders: number;
  pendingOrders: number;
  needsReviewCount: number;
  dailySalesInr: number;
  outstandingUdhaarInr: number;
  dailySeries: DailyMetricPoint[];
  topProducts: TopProductMetric[];
  paymentDistribution: {
    mode: string;
    value: number;
    amountInr: number;
    color: string;
  }[];
  recentActivity: {
    id: string;
    customerName: string;
    action: string;
    amountInr?: number;
    timestamp: string;
    kind: 'order' | 'payment' | 'review';
  }[];
  source: DataSourceMode;
}

export interface BusinessSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  shopAddress: string;
  city: string;
  defaultLanguage: SupportedLanguage;
  currency: 'INR';
  autoFlagConfidenceThreshold: number;
  requireConfirmationForUdhaar: boolean;
  whatsappDigestEnabled: boolean;
  businessType: 'kirana' | 'clinic';
}

export interface ClinicAppointmentExtraction {
  id: string;
  audioLabel: string;
  durationSec: number;
  language: string;
  transcription: string;
  patientName: string;
  patientPhone: string;
  doctor: string;
  department: string;
  requestedDate: string;
  requestedTime: string;
  symptomsNote: string;
  confidence: number;
  status: 'awaiting_confirmation' | 'confirmed' | 'reschedule_requested';
}
