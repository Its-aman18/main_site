import React from 'react';
import { ShieldAlert, ArrowLeft, Calendar, Shield } from 'lucide-react';
import { useSimulation } from '../services/simulationContext';

interface AdminAccessDeniedPageProps {
  onNavigate: (view: string) => void;
  targetPath?: string;
}

export const AdminAccessDeniedPage: React.FC<AdminAccessDeniedPageProps> = ({
  onNavigate,
  targetPath = '/admin.html',
}) => {
  const { loginWithCredentials } = useSimulation();

  const handleBackToZeroOne = () => {
    if (window.location.pathname.includes('admin.html')) {
      window.location.href = '/';
    } else {
      onNavigate('landing');
    }
  };

  const handleBackToEvents = () => {
    if (window.location.pathname.includes('admin.html')) {
      window.location.href = '/#events-directory';
    } else {
      onNavigate('events-directory');
    }
  };

  const handleLoginAsAdmin = async () => {
    await loginWithCredentials('admin@example.com', 'change_this_password');
    if (window.location.pathname.includes('admin.html')) {
      window.location.reload();
    } else {
      onNavigate('admin-control');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full card p-8 sm:p-10 space-y-6 text-center shadow-2xl border-red-500/20 relative overflow-hidden bg-white dark:bg-[#12141C]">
        {/* Shield Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Heading & Subtitle as per Requirement 14 */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            HTTP 403 • FORBIDDEN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
            ACCESS RESTRICTED
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Your Code.SCRIET account does not have verified administrator authorization for ZERO → ONE.
          </p>
        </div>

        {/* 1-Click Super Admin Sign In */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLoginAsAdmin}
            className="w-full py-3 px-5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 text-orange-500" />
            <span>1-Click Switch to Super Admin</span>
          </button>
        </div>

        {/* Navigation Buttons: Back to ZERO -> ONE and Back to Events */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="btn-back-zero-one"
            onClick={handleBackToZeroOne}
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to ZERO → ONE</span>
          </button>

          <button
            id="btn-back-events"
            onClick={handleBackToEvents}
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Back to Events</span>
          </button>
        </div>
      </div>
    </div>
  );
};
