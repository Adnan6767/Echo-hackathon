import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleSectionLink = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F0E8] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
          scrolled
            ? 'bg-[#101010]/95 border-b border-white/[0.08]'
            : 'bg-[#101010]/70 border-b border-transparent'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#F5F0E8] whitespace-nowrap shrink-0"
          >
            <span className="inline-flex items-end gap-[2.5px] h-4" aria-hidden="true">
              <span className="w-[2.5px] h-2 bg-[#FF7139] rounded-full" />
              <span className="w-[2.5px] h-4 bg-[#FF7139] rounded-full" />
              <span className="w-[2.5px] h-2.5 bg-[#FF7139] rounded-full" />
            </span>
            <span>ECHO</span>
          </Link>

          {/* Zone 2: 5 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#929292]"
          >
            <button
              type="button"
              onClick={() => handleSectionLink('how-it-works')}
              className="hover:text-[#F5F0E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('the-problem')}
              className="hover:text-[#F5F0E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              The problem
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('solutions')}
              className="hover:text-[#F5F0E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Solutions
            </button>
            <Link
              to="/demo"
              className={`transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/demo' ? 'text-[#F5F0E8]' : 'hover:text-[#F5F0E8]'
              }`}
            >
              Live demo
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-[#F5F0E8] transition-colors whitespace-nowrap shrink-0"
            >
              Dashboard
            </Link>
          </nav>

          {/* Zone 3: 1 Primary CTA + Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/demo"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors whitespace-nowrap shrink-0"
            >
              Try ECHO
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden w-11 h-11 rounded-lg border border-white/[0.1] bg-[#1B1B1B] text-[#F5F0E8] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 z-30 bg-[#1B1B1B] border-b border-white/[0.1] px-5 py-5 lg:hidden shadow-2xl"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleSectionLink('how-it-works')}
                className="text-left px-3 py-3 text-base font-medium text-[#F5F0E8] hover:bg-[#242424] rounded-lg"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => handleSectionLink('the-problem')}
                className="text-left px-3 py-3 text-base font-medium text-[#F5F0E8] hover:bg-[#242424] rounded-lg"
              >
                The problem
              </button>
              <button
                type="button"
                onClick={() => handleSectionLink('solutions')}
                className="text-left px-3 py-3 text-base font-medium text-[#F5F0E8] hover:bg-[#242424] rounded-lg"
              >
                Solutions
              </button>
              <Link
                to="/demo"
                className="px-3 py-3 text-base font-medium text-[#F5F0E8] hover:bg-[#242424] rounded-lg"
              >
                Live demo
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-3 text-base font-medium text-[#F5F0E8] hover:bg-[#242424] rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/clinic"
                className="px-3 py-3 text-base font-medium text-[#929292] hover:text-[#F5F0E8] hover:bg-[#242424] rounded-lg"
              >
                Clinic prototype
              </Link>
              <div className="pt-3 mt-2 border-t border-white/[0.08]">
                <Link
                  to="/demo"
                  className="w-full inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-lg bg-[#FF7139] text-[#101010]"
                >
                  Try ECHO
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
