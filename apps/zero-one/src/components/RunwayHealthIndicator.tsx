import React from 'react';
import { useSimulation } from '../services/simulationContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

interface RunwayHealthIndicatorProps {
  className?: string;
}

export const RunwayHealthIndicator: React.FC<RunwayHealthIndicatorProps> = ({ className = '' }) => {
  const { currentTeam, getBalance, getRunwayMonths, getFinancialHealthBand } = useSimulation();

  const balance = getBalance();
  const runwayMonths = getRunwayMonths();
  const healthBand = getFinancialHealthBand();
  const healthScore = currentTeam.healthScore;
  const breakdown = currentTeam.healthBreakdown;

  // SVG Circular Gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Runway & Capital Overview */}
      <div className="card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Runway & Burn Rate
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                healthBand === 'HEALTHY'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : healthBand === 'WATCH'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
              }`}
            >
              {healthBand === 'HEALTHY' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {healthBand === 'WATCH' && <AlertTriangle className="w-3.5 h-3.5" />}
              {healthBand === 'CRITICAL' && <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{healthBand} BAND</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-heading">
              {runwayMonths}
            </span>
            <span className="text-sm font-semibold text-stone-500">Months of Runway</span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            Based on current operational burn and reserve allocation of ₹{balance.toLocaleString('en-IN')}.
          </p>
        </div>

        {/* Runway Progress Bar */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="flex justify-between text-xs text-stone-500 font-medium mb-1.5">
            <span>Critical (&lt;2 mo)</span>
            <span>Watch (2–4 mo)</span>
            <span>Healthy (&gt;4 mo)</span>
          </div>
          <div className="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                healthBand === 'HEALTHY'
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  : healthBand === 'WATCH'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                  : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${Math.min(100, (runwayMonths / 8) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Startup Health Donut Chart (Matches screenshot 3) */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Circular Donut Gauge */}
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="text-stone-100 dark:text-stone-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="text-orange-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-stone-900 dark:text-stone-100 font-heading">
                {healthScore}%
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Startup Health
            </div>
            <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {healthScore >= 70 ? 'Prime Valuation' : healthScore >= 50 ? 'Steady Growth' : 'High Volatility'}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              Composite operational score
            </div>
          </div>
        </div>

        {/* Legend / Breakdown dots matching screenshot 3 */}
        <div className="space-y-1.5 text-xs font-medium text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="w-16">Financial:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
              {breakdown.financial}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="w-16">Product:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
              {breakdown.product}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-16">Marketing:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
              {breakdown.marketing}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="w-16">Stability:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
              {breakdown.teamStability}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
