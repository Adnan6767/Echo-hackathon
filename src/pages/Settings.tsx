import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import { SUPPORTED_LANGUAGES } from '../mocks/data';
import { API_BASE_URL } from '../api/client';
import { useEchoSettings } from '../hooks/useEchoData';
import { useToast } from '../hooks/useToast';
import type { BusinessSettings } from '../types';

const settingsSchema = z.object({
  shopName: z.string().trim().min(2, 'Shop name is required').max(80),
  ownerName: z.string().trim().min(2, 'Owner name is required').max(60),
  phone: z.string().trim().max(20),
  shopAddress: z.string().trim().min(5, 'Shop address is required').max(160),
  city: z.string().trim().min(2, 'City is required').max(50),
  defaultLanguage: z.enum(['hi-IN', 'en-IN', 'hinglish', 'mr-IN', 'gu-IN']),
  currency: z.literal('INR'),
  autoFlagConfidenceThreshold: z.number({ message: 'Enter a number between 50 and 95' }).min(50).max(95),
  requireConfirmationForUdhaar: z.boolean(),
  whatsappDigestEnabled: z.boolean(),
  businessType: z.enum(['kirana', 'clinic']),
});

export default function Settings() {
  const [settings, setSettings] = useEchoSettings();
  const { pushToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BusinessSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (values: BusinessSettings) => {
    setSettings(values);
    pushToast({
      variant: 'success',
      title: 'Business settings saved',
      description: `Updated preferences for ${values.shopName}.`,
    });
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Shop profile, default spoken language, currency, and voice confirmation thresholds"
    >
      <div className="space-y-6 max-w-4xl">
        <ModeBanner compact />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shop & Profile Settings */}
          <section className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 space-y-5">
            <div className="pb-4 border-b border-white/[0.08]">
              <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
                Shop &amp; Owner Profile
              </h2>
              <p className="text-xs text-[#929292] mt-0.5">
                Displayed across order records, ledger receipts, and dashboard header.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="shopName" className="block text-xs text-[#929292] mb-1.5">
                  Shop name
                </label>
                <input
                  id="shopName"
                  type="text"
                  {...register('shopName')}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                />
                {errors.shopName && (
                  <p className="text-xs text-[#E56D65] mt-1">{errors.shopName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-xs text-[#929292] mb-1.5">
                  Owner / Profile name
                </label>
                <input
                  id="ownerName"
                  type="text"
                  {...register('ownerName')}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                />
                {errors.ownerName && (
                  <p className="text-xs text-[#E56D65] mt-1">{errors.ownerName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs text-[#929292] mb-1.5">
                  Contact phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Optional phone number"
                  {...register('phone')}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm font-mono text-[#F5F0E8] placeholder:text-[#929292]/60 focus:border-[#FF7139] focus:outline-none"
                />
                {errors.phone && (
                  <p className="text-xs text-[#E56D65] mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="shopAddress" className="block text-xs text-[#929292] mb-1.5">
                  Shop address
                </label>
                <input
                  id="shopAddress"
                  type="text"
                  {...register('shopAddress')}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                />
                {errors.shopAddress && (
                  <p className="text-xs text-[#E56D65] mt-1">{errors.shopAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-xs text-[#929292] mb-1.5">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city')}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-xs text-[#929292] mb-1.5">
                  Currency
                </label>
                <input
                  id="currency"
                  type="text"
                  readOnly
                  {...register('currency')}
                  className="w-full rounded-xl bg-[#141414] border border-white/[0.08] px-3.5 py-2.5 text-sm font-mono text-[#929292]"
                />
              </div>
            </div>
          </section>

          {/* Language & Voice Processing Preferences */}
          <section className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 space-y-5">
            <div className="pb-4 border-b border-white/[0.08]">
              <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
                Language &amp; Business Preferences
              </h2>
              <p className="text-xs text-[#929292] mt-0.5">
                Configure default voice intake language and confirmation safety rules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="defaultLanguage" className="block text-xs text-[#929292] mb-1.5">
                  Default language
                </label>
                <select
                  id="defaultLanguage"
                  {...register('defaultLanguage')}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#1B1B1B]">
                      {l.label} ({l.nativeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="autoFlagConfidenceThreshold"
                  className="block text-xs text-[#929292] mb-1.5"
                >
                  Review queue confidence threshold (%)
                </label>
                <input
                  id="autoFlagConfidenceThreshold"
                  type="number"
                  min={50}
                  max={95}
                  {...register('autoFlagConfidenceThreshold', { valueAsNumber: true })}
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('requireConfirmationForUdhaar')}
                  className="mt-1 accent-[#FF7139] w-4 h-4"
                />
                <span className="text-sm text-[#F5F0E8]">
                  Require manual shopkeeper confirmation before writing Udhaar entries
                  <span className="block text-xs text-[#929292] mt-0.5">
                    Recommended to prevent billing disputes on ambiguous credit notes.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('whatsappDigestEnabled')}
                  className="mt-1 accent-[#FF7139] w-4 h-4"
                />
                <span className="text-sm text-[#F5F0E8]">
                  Prepare end-of-day sales &amp; udhaar summary digest
                  <span className="block text-xs text-[#929292] mt-0.5">
                    Generates a daily closing summary once backend scheduling is connected.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* Backend API Environment Info */}
          <section className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 space-y-3">
            <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
              Backend Integration Configuration
            </h2>
            <p className="text-xs text-[#929292] leading-relaxed">
              Configured via environment variables (<code className="font-mono text-[#F5F0E8]">VITE_API_BASE_URL</code> and{' '}
              <code className="font-mono text-[#F5F0E8]">VITE_USE_MOCK_DATA</code>).
            </p>
            <div className="rounded-xl bg-[#101010] border border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#929292]">Target Python API Base URL</span>
              <span className="text-[#F5F0E8]">{API_BASE_URL}</span>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>{isDirty ? 'Save settings' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
