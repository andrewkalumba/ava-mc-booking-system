'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

const menuItems = [
  { icon: '📊', labelKey: 'dashboard', href: '/dashboard' },
  { icon: '🏍', labelKey: 'inventory', href: '/inventory' },
  { icon: '📦', labelKey: 'purchaseOrders', href: '/purchase-orders' },
  { icon: '💰', labelKey: 'salesPipeline', href: '/sales/leads/new' },
  { icon: '👥', labelKey: 'customers', href: '/customers' },
  { icon: '📧', labelKey: 'invoices', href: '/invoices' },
  { icon: '📄', labelKey: 'documents', href: '/documents' },
  { icon: '📈', labelKey: 'analytics', href: '/analytics' },
  { icon: '⚙', labelKey: 'settings', href: '/settings' },
  { icon: '👤', labelKey: 'users', href: '/users' },
  { icon: '📜', labelKey: 'auditLog', href: '/audit-log' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#0f1729] text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 h-screen bg-[#0f1729] text-slate-300 fixed left-0 top-0 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="px-6 py-6">
        <h1 className="text-[#FF6B2C] text-2xl font-bold">
          {t('common.appName')}
          <span className="text-slate-500 text-xs ml-2">{t('common.version')}</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/sales/leads/new' && pathname?.startsWith('/sales'));

          return (
            <Link key={item.href} href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors
                ${isActive
                  ? 'bg-[#1e2a3f] text-white border-l-2 border-[#FF6B2C]'
                  : 'text-slate-400 hover:bg-[#1a2332] hover:text-slate-200'
                }
              `}>
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{t(`navigation.${item.labelKey}`)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language Selector */}
      <div className="px-3 py-3 border-t border-slate-700">
        <LanguageSwitcher variant="default" />
      </div>

      {/* User Info at bottom */}
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#FF6B2C] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user ? (user.givenName?.[0] || user.name?.[0] || 'U') : 'U'}
          </div>
          <div className="text-xs flex-1">
            <div className="text-white font-medium">
              {user ? (user.givenName || user.name || t('common.user')) : t('common.user')}
            </div>
            <div className="text-slate-500">{t('common.admin')}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
        >
          <span>🚪</span>
          <span>{t('common.signOut')}</span>
        </button>
      </div>
    </div>
    </>
  );
}

export default Sidebar;