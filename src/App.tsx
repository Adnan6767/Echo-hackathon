import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/common/ToastContainer';

const Home = lazy(() => import('./pages/Home'));
const Demo = lazy(() => import('./pages/Demo'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const Ledger = lazy(() => import('./pages/Ledger'));
const ReviewQueue = lazy(() => import('./pages/ReviewQueue'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Clinic = lazy(() => import('./pages/Clinic'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F0E8] flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[#929292]">
        <span className="inline-flex items-end gap-[2.5px] h-4" aria-hidden="true">
          <span className="w-[2.5px] h-2 bg-[#FF7139] rounded-full echo-wave-bar" />
          <span className="w-[2.5px] h-4 bg-[#FF7139] rounded-full echo-wave-bar" />
          <span className="w-[2.5px] h-2.5 bg-[#FF7139] rounded-full echo-wave-bar" />
        </span>
        <span>Loading ECHO...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/orders" element={<Orders />} />
            <Route path="/dashboard/ledger" element={<Ledger />} />
            <Route path="/dashboard/review" element={<ReviewQueue />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/clinic" element={<Clinic />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}
