import React, { useState, useEffect } from 'react';
import { SimulationProvider, useSimulation } from './services/simulationContext';
import { AdminControlCenter } from './pages/AdminControlCenter';
import { AdminAccessDeniedPage } from './pages/AdminAccessDeniedPage';
import { LockdownOverlay } from './components/LockdownOverlay';
import { CodeScrietLogo } from './components/CodeScrietLogo';
import { Sun, Moon, ArrowLeft, Shield, ShieldCheck, LogOut } from 'lucide-react';

const AdminRootApp: React.FC = () => {
  const {
    currentUser,
    isAdminVerified,
    getAdminStatus,
    isSuperAdmin,
    logout,
  } = useSimulation();

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'verification' || hash === 'admin-verification') return 'ADMIN_VERIFICATION';
    if (hash === 'audit' || hash === 'audit-logs') return 'AUDIT_LOGS';
    if (hash === 'events' || hash === 'event-control') return 'EVENT_CONTROL';
    if (hash === 'teams') return 'TEAMS';
    if (hash === 'finance') return 'FINANCE';
    if (hash === 'market') return 'MARKET';
    if (hash === 'crisis') return 'CRISIS';
    if (hash === 'auction') return 'AUCTION';
    if (hash === 'judges') return 'JUDGING';
    if (hash === 'live-screen') return 'LIVE_SCREEN';
    return 'OVERVIEW';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Sync tab on hash change
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'verification' || hash === 'admin-verification') setCurrentTab('ADMIN_VERIFICATION');
      else if (hash === 'audit' || hash === 'audit-logs') setCurrentTab('AUDIT_LOGS');
      else if (hash === 'events' || hash === 'event-control') setCurrentTab('EVENT_CONTROL');
      else if (hash === 'teams') setCurrentTab('TEAMS');
      else if (hash === 'finance') setCurrentTab('FINANCE');
      else if (hash === 'market') setCurrentTab('MARKET');
      else if (hash === 'crisis') setCurrentTab('CRISIS');
      else if (hash === 'auction') setCurrentTab('AUCTION');
      else if (hash === 'judges') setCurrentTab('JUDGING');
      else if (hash === 'live-screen') setCurrentTab('LIVE_SCREEN');
      else if (hash === 'overview' || hash === 'dashboard') setCurrentTab('OVERVIEW');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('codescriet-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('codescriet-theme', 'light');
    }
  };

  const handleNavigate = (view: string) => {
    if (view === 'landing' || view === 'events-directory' || view === 'team-dashboard' || view === 'live-screen') {
      window.location.href = `/#${view}`;
    } else {
      window.location.hash = view;
    }
  };

  const verified = isAdminVerified();

  return (
    <div className="min-h-screen flex flex-col bg-[#07080B] text-stone-100 transition-colors">
      {/* Admin Top Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#202432] bg-[#07080B]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Branding & Subtitle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              title="Return to Participant Platform"
            >
              <CodeScrietLogo size={30} />
            </a>

            <div className="h-4 w-px bg-stone-700" />

            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-extrabold tracking-wide uppercase text-orange-500">
                ZERO → ONE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
                ADMIN CONTROL CENTER
              </span>
            </div>
          </div>

          {/* Right: Actions & User info */}
          <div className="flex items-center gap-3">
            {/* Return to Participant Side Link */}
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-300 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Participant Dashboard</span>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 bg-stone-900 border border-stone-800 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-400" />}
            </button>

            {/* Admin Identity Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-orange-500"
                />
                <div className="hidden md:block text-left text-xs">
                  <div className="font-bold text-stone-200 leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-stone-500 leading-tight">
                    {verified ? (isSuperAdmin() ? 'Super Admin' : 'Admin') : 'Normal User'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Lockdown Freeze Layer */}
      <LockdownOverlay />

      {/* Content Router: Protected Admin View or 403 Forbidden Access Denied */}
      <main className="flex-1">
        {verified ? (
          <AdminControlCenter initialTab={currentTab} onNavigate={handleNavigate} />
        ) : (
          <AdminAccessDeniedPage
            targetPath="/admin.html"
            onNavigate={(view) => {
              window.location.href = `/#${view}`;
            }}
          />
        )}
      </main>
    </div>
  );
};

export const AdminApp: React.FC = () => {
  return (
    <SimulationProvider>
      <AdminRootApp />
    </SimulationProvider>
  );
};

export default AdminApp;
