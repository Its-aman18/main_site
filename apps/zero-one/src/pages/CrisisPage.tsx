import React from 'react';
import { useSimulation } from '../services/simulationContext';
import { CrisisModal } from '../components/CrisisModal';
import { AlertTriangle, ShieldCheck, Zap, History } from 'lucide-react';

interface CrisisPageProps {
  onNavigate: (view: string) => void;
}

export const CrisisPage: React.FC<CrisisPageProps> = ({ onNavigate }) => {
  const { activeCrisis, currentRole, currentTeam } = useSimulation();

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Role contextual advisory bar */}
        <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>
              Logged in as <strong>{currentRole}</strong> of <strong>{currentTeam.name}</strong>. Decisions require cross-role founder alignment.
            </span>
          </div>
          <button
            onClick={() => onNavigate('team-dashboard')}
            className="text-orange-600 font-bold hover:underline flex-shrink-0 ml-3"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Crisis Active or Solved State */}
        {activeCrisis ? (
          <CrisisModal />
        ) : (
          <div className="card p-12 text-center space-y-3">
            <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100">
              No Active Crises
            </h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Your startup operations are currently stable. The event engine dispatches market shocks and unexpected crises dynamically each round.
            </p>
            <button
              onClick={() => onNavigate('market')}
              className="btn-primary mt-2 text-xs font-bold py-2.5 px-6"
            >
              Browse Digital Market →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
