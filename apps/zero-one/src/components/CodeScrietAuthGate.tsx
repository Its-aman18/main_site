import React from 'react';
import { useSimulation, AuthStateType } from '../services/simulationContext';
import { getLoginUrl } from '../lib/mainSite';
import { CodeScrietLogo } from './CodeScrietLogo';
import { AdminAccessDeniedPage } from '../pages/AdminAccessDeniedPage';
import { Shield, LogIn, Clock, AlertTriangle } from 'lucide-react';

interface CodeScrietAuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  targetPath?: string;
  onNavigate?: (view: string) => void;
}

export const CodeScrietAuthGate: React.FC<CodeScrietAuthGateProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  targetPath = '/admin.html',
  onNavigate = () => {},
}) => {
  const { authState, isLoggedIn, isAdminVerified, logout } = useSimulation();

  // If view is public and does not require authentication
  if (!requireAuth && !requireAdmin) {
    return <>{children}</>;
  }

  // Loading state
  if (authState === 'AUTH_LOADING') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center animate-spin">
          <CodeScrietLogo size={32} showText={false} />
        </div>
        <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
          Verifying Code.SCRIET Session...
        </h2>
        <p className="text-xs text-stone-500 max-w-sm">
          Validating cryptographic identity against authoritative Code.SCRIET platform.
        </p>
      </div>
    );
  }

  // Expired session state
  if (authState === 'SESSION_EXPIRED') {
    const returnUrl = typeof window !== 'undefined' ? window.location.href : '/';
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full card p-8 text-center space-y-6 shadow-2xl border-amber-500/30 bg-white dark:bg-[#12141C]">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Session Expired
            </span>
            <h1 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100">
              Your Code.SCRIET session has expired
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Please re-authenticate with your Code.SCRIET credentials to continue your simulation session.
            </p>
          </div>
          <a
            href={getLoginUrl(returnUrl)}
            onClick={() => logout()}
            className="w-full btn-primary text-xs py-3 px-6 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Continue with Code.SCRIET</span>
          </a>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!isLoggedIn || authState === 'NOT_AUTHENTICATED' || authState === 'INVALID_SESSION') {
    const returnUrl = typeof window !== 'undefined' ? window.location.href : '/';
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full card p-8 sm:p-10 text-center space-y-6 shadow-2xl border-orange-500/20 bg-white dark:bg-[#12141C]">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              Authentication Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-stone-900 dark:text-stone-100">
              Code.SCRIET Account Required
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              ZERO → ONE uses centralized authentication via <strong className="text-stone-800 dark:text-stone-200">codescriet.dev</strong>. Sign in once to access squad tools, live trading, and event synchronization.
            </p>
          </div>

          <a
            href={getLoginUrl(returnUrl)}
            className="w-full btn-primary text-xs py-3.5 px-6 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
          >
            <LogIn className="w-4 h-4" />
            <span>Continue with Code.SCRIET</span>
          </a>

          <p className="text-[11px] text-stone-400">
            No separate account or password required.
          </p>
        </div>
      </div>
    );
  }

  // Admin authorization required check
  if (requireAdmin && !isAdminVerified()) {
    return <AdminAccessDeniedPage targetPath={targetPath} onNavigate={onNavigate} />;
  }

  // Authenticated & authorized
  return <>{children}</>;
};
export default CodeScrietAuthGate;
