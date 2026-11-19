import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Mic,
  Settings,
  ShoppingBag,
  Stethoscope,
  Store,
  X,
} from 'lucide-react';
import { useEchoDashboardData, useEchoSettings } from '../hooks/useEchoData';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settings] = useEchoSettings();
  const { reviewQueue } = useEchoDashboardData();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, end: false },
    { to: '/dashboard/ledger', label: 'Customer ledger', icon: BookOpenCheck, end: false },
    {
      to: '/dashboard/review',
      label: 'Review queue',
      icon: AlertCircle,
      end: false,
      count: reviewQueue.length,
    },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, end: false },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[#151515] border-r border-white/[0.08]">
      {/* Brand + Collapse */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.08]">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#F5F0E8] whitespace-nowrap"
        >
          <span className="inline-flex items-end gap-[2.5px] h-4 shrink-0" aria-hidden="true">
            <span className="w-[2.5px] h-2 bg-[#FF7139] rounded-full" />
            <span className="w-[2.5px] h-4 bg-[#FF7139] rounded-full" />
            <span className="w-[2.5px] h-2.5 bg-[#FF7139] rounded-full" />
          </span>
          {(!collapsed || isMobile) && <span>ECHO</span>}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-lg text-[#929292] hover:text-[#F5F0E8] hover:bg-[#242424]"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-[#929292] hover:text-[#F5F0E8] hover:bg-[#242424] transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Business Profile Selector */}
      {(!collapsed || isMobile) && (
        <div className="p-3 border-b border-white/[0.08] relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl bg-[#1B1B1B] border border-white/[0.08] hover:border-white/[0.16] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#242424] text-[#FF7139] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#F5F0E8] truncate">
                  {settings.shopName}
                </p>
                <p className="text-[11px] text-[#929292] truncate">Kirana · {settings.city}</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#929292] shrink-0" aria-hidden="true" />
          </button>

          {profileMenuOpen && (
            <div className="mt-1.5 bg-[#1B1B1B] border border-white/[0.1] rounded-xl p-1.5 space-y-1 shadow-xl">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#242424] text-left"
              >
                <Store className="w-3.5 h-3.5 text-[#FF7139] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#F5F0E8] truncate">{settings.shopName}</p>
                  <p className="text-[11px] text-[#929292]">Active Kirana workspace</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate('/clinic');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#242424] text-left transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#929292] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#F5F0E8] truncate">
                    Arogya Care Clinic
                  </p>
                  <p className="text-[11px] text-[#929292]">Secondary prototype</p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary Sidebar Navigation */}
      <nav aria-label="Dashboard navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !isMobile ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#242424] text-[#F5F0E8]'
                    : 'text-[#929292] hover:text-[#F5F0E8] hover:bg-[#1B1B1B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#FF7139]' : 'text-current'
                      }`}
                      aria-hidden="true"
                    />
                    {(!collapsed || isMobile) && (
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    )}
                  </span>
                  {(!collapsed || isMobile) && typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-xs font-mono tabular-nums text-[#E8B75B]">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/[0.08] space-y-1">
          <Link
            to="/demo"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FF7139] hover:bg-[#1B1B1B] transition-colors"
          >
            <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
            {(!collapsed || isMobile) && (
              <span className="whitespace-nowrap">Voice demo intake</span>
            )}
          </Link>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#929292] hover:text-[#F5F0E8] hover:bg-[#1B1B1B] transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            {(!collapsed || isMobile) && (
              <span className="whitespace-nowrap">Back to website</span>
            )}
          </Link>
        </div>
      </nav>

      {/* User Profile Area */}
      <div className="p-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#242424] border border-white/[0.1] flex items-center justify-center text-xs font-display font-semibold text-[#F5F0E8] shrink-0">
            {settings.ownerName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#F5F0E8] truncate">
                {settings.ownerName}
              </p>
              <p className="text-[11px] text-[#929292] truncate">Shopkeeper · INR</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F0E8] flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/75"
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Dashboard Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-[#101010]/95 border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open dashboard menu"
              className="lg:hidden w-10 h-10 rounded-lg border border-white/[0.1] bg-[#1B1B1B] flex items-center justify-center text-[#F5F0E8] shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#929292]">
                <span>Dashboard</span>
                <span aria-hidden="true">/</span>
                <span className="text-[#F5F0E8] truncate">{title}</span>
              </div>
              {subtitle && (
                <p className="text-xs text-[#929292] hidden sm:block truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {location.pathname !== '/dashboard/review' && reviewQueue.length > 0 && (
              <Link
                to="/dashboard/review"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#E8B75B] hover:text-[#F5F0E8] border border-white/[0.08] hover:border-white/[0.16] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span className="font-mono tabular-nums">{reviewQueue.length}</span>
                <span>needs review</span>
              </Link>
            )}
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors whitespace-nowrap shrink-0"
            >
              <Mic className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Upload voice note</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
