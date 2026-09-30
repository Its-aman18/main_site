import React, { useState, useEffect } from 'react';
import { SimulationProvider, useSimulation } from './services/simulationContext';
import { Header } from './components/Header';
import { CodeScrietLogo } from './components/CodeScrietLogo';
import { LockdownOverlay } from './components/LockdownOverlay';
import { LandingPage } from './pages/LandingPage';
import { EventsDirectoryPage } from './pages/EventsDirectoryPage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';
import { DigitalMarketPage } from './pages/DigitalMarketPage';
import { CrisisPage } from './pages/CrisisPage';
import { LiveScreenPage } from './pages/LiveScreenPage';
import { AdminControlCenter } from './pages/AdminControlCenter';
import { StartupCanvasPage } from './pages/StartupCanvasPage';
import { JudgePortalPage } from './pages/JudgePortalPage';
import { MarshalPortalPage } from './pages/MarshalPortalPage';
import { InventoryTransactionsPage } from './pages/InventoryTransactionsPage';
import { AuctionTradePage } from './pages/AuctionTradePage';
import { ResultsRevealPage } from './pages/ResultsRevealPage';
import { JoinOnboardingPage } from './pages/JoinOnboardingPage';
import { PitchPage } from './pages/PitchPage';
import { AdminAccessDeniedPage } from './pages/AdminAccessDeniedPage';

const SimulationApp: React.FC = () => {
  const { isAdminVerified } = useSimulation();
  // Navigation State with URL Hash and Query Sync
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return 'landing';
  });

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Normalize route aliases
  const normalizedView = (() => {
    switch (currentView) {
      case 'home':
        return 'landing';
      case 'events':
        return 'events-directory';
      case 'admin':
      case 'admin-panel':
      case 'admin/dashboard':
        return 'admin-control';
      case 'admin/verification':
      case 'admin-verification':
      case 'verification':
        return 'admin-verification';
      case 'marshal':
      case 'marshal-console':
        return 'marshal-portal';
      case 'judge':
        return 'judge-portal';
      case 'dashboard':
      case 'team-hub':
        return 'team-dashboard';
      case 'trade':
        return 'auction';
      default:
        return currentView;
    }
  })();

  const knownViews = [
    'landing',
    'events-directory',
    'onboarding',
    'team-dashboard',
    'market',
    'crisis',
    'live-screen',
    'admin-control',
    'admin-verification',
    'canvas',
    'inventory',
    'transactions',
    'team',
    'judge-portal',
    'marshal-portal',
    'auction',
    'pitch',
    'reveal',
    'announcements',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 transition-colors">
      {/* Official Header */}
      <Header currentView={normalizedView} onNavigate={navigateTo} />

      {/* Emergency Lockdown Freeze Layer */}
      <LockdownOverlay />

      {/* Main View Switcher */}
      <div className="flex-1">
        {normalizedView === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {normalizedView === 'events-directory' && <EventsDirectoryPage onNavigate={navigateTo} />}
        {normalizedView === 'onboarding' && <JoinOnboardingPage onNavigate={navigateTo} />}
        {normalizedView === 'team-dashboard' && <TeamDashboardPage onNavigate={navigateTo} />}
        {normalizedView === 'market' && <DigitalMarketPage onNavigate={navigateTo} />}
        {normalizedView === 'crisis' && <CrisisPage onNavigate={navigateTo} />}
        {normalizedView === 'live-screen' && <LiveScreenPage onNavigate={navigateTo} />}
        {normalizedView === 'admin-control' &&
          (isAdminVerified() ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center animate-spin">
                <CodeScrietLogo size={28} />
              </div>
              <h2 className="text-xl font-bold font-heading">Redirecting to Admin Control Center...</h2>
              <p className="text-xs text-stone-500">Launching separate mission control interface at /admin.html</p>
              <a
                href="/admin.html"
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 shadow-md transition-all"
              >
                Click here if not redirected automatically
              </a>
            </div>
          ) : (
            <AdminAccessDeniedPage onNavigate={navigateTo} targetPath="/admin.html" />
          ))}
        {normalizedView === 'admin-verification' &&
          (isAdminVerified() ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h2 className="text-xl font-bold font-heading">Redirecting to Admin Verification Center...</h2>
              <a
                href="/admin.html#verification"
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 shadow-md transition-all"
              >
                Open Admin Verification (admin.html#verification)
              </a>
            </div>
          ) : (
            <AdminAccessDeniedPage onNavigate={navigateTo} targetPath="/admin.html#verification" />
          ))}
        {normalizedView === 'canvas' && <StartupCanvasPage onNavigate={navigateTo} />}
        {normalizedView === 'inventory' && (
          <InventoryTransactionsPage initialTab="INVENTORY" onNavigate={navigateTo} />
        )}
        {normalizedView === 'transactions' && (
          <InventoryTransactionsPage initialTab="TRANSACTIONS" onNavigate={navigateTo} />
        )}
        {normalizedView === 'team' && <MarshalPortalPage onNavigate={navigateTo} />}
        {normalizedView === 'judge-portal' && <JudgePortalPage onNavigate={navigateTo} />}
        {normalizedView === 'marshal-portal' && <MarshalPortalPage onNavigate={navigateTo} />}
        {normalizedView === 'auction' && <AuctionTradePage onNavigate={navigateTo} />}
        {normalizedView === 'pitch' && <PitchPage onNavigate={navigateTo} />}
        {normalizedView === 'reveal' && <ResultsRevealPage onNavigate={navigateTo} />}
        {normalizedView === 'announcements' && (
          <div className="max-w-4xl mx-auto py-10 px-4">
            <h2 className="text-2xl font-bold font-heading mb-4">Official Announcements</h2>
            <div className="card p-6 space-y-3">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 text-xs">
                <strong>Round 2: Build & Grow is live!</strong> Market open with dynamic pricing.
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 text-xs">
                <strong>Market Surge Alert:</strong> Cloud Credits demand spike active (+20%).
              </div>
            </div>
          </div>
        )}

        {/* Fallback for unknown routes */}
        {!knownViews.includes(normalizedView) && (
          <LandingPage onNavigate={navigateTo} />
        )}
      </div>

      {/* Official Code.SCRIET Footer */}
      <footer className="border-t border-[#EFE8DD] dark:border-[#202432] bg-[#FAF8F5] dark:bg-[#07080B] py-8 text-xs text-stone-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CodeScrietLogo size={20} showText={false} />
            <span className="font-bold text-stone-800 dark:text-stone-200">code.scriet</span>
            <span>•</span>
            <span>Official Coding Club of SCRIET, CCS University Meerut</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button onClick={() => navigateTo('landing')} className="hover:text-orange-500">
              ZERO → ONE Platform
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('events-directory')} className="hover:text-orange-500">
              codescriet.dev/events
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('reveal')} className="hover:text-orange-500">
              Winners Reveal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <SimulationProvider>
      <SimulationApp />
    </SimulationProvider>
  );
}

export default App;
