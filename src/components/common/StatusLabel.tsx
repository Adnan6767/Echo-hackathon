import { AlertCircle, CheckCircle2, Clock, Package, XCircle } from 'lucide-react';
import type { OrderStatus, PaymentMode } from '../../types';

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; colorClass: string; icon: typeof Clock }
> = {
  received: {
    label: 'Received',
    colorClass: 'text-[#F5F0E8]',
    icon: Clock,
  },
  needs_confirmation: {
    label: 'Needs confirmation',
    colorClass: 'text-[#E8B75B]',
    icon: AlertCircle,
  },
  packed: {
    label: 'Packed',
    colorClass: 'text-[#FF7139]',
    icon: Package,
  },
  delivered: {
    label: 'Delivered',
    colorClass: 'text-[#40C98A]',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    colorClass: 'text-[#E56D65]',
    icon: XCircle,
  },
};

export function OrderStatusLabel({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${cfg.colorClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{cfg.label}</span>
    </span>
  );
}

const PAYMENT_CONFIG: Record<PaymentMode, { label: string; colorClass: string }> = {
  udhaar: { label: 'Udhaar (Credit)', colorClass: 'text-[#FF7139]' },
  upi: { label: 'UPI', colorClass: 'text-[#40C98A]' },
  cash: { label: 'Cash', colorClass: 'text-[#F5F0E8]' },
  pending: { label: 'Unconfirmed', colorClass: 'text-[#E8B75B]' },
};

export function PaymentModeLabel({ mode }: { mode: PaymentMode }) {
  const cfg = PAYMENT_CONFIG[mode];
  return <span className={`text-xs font-medium whitespace-nowrap ${cfg.colorClass}`}>{cfg.label}</span>;
}

export function ConfidenceIndicator({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85 ? 'text-[#40C98A]' : pct >= 70 ? 'text-[#E8B75B]' : 'text-[#E56D65]';
  const label = pct >= 85 ? 'High' : pct >= 70 ? 'Moderate' : 'Low — Review';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono tabular-nums ${color}`}>
      <span>{pct}%</span>
      <span className="text-[#929292]" aria-hidden="true">
        ·
      </span>
      <span className="font-sans">{label}</span>
    </span>
  );
}
