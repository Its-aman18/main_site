// =========================================================================
// ZERO → ONE PARTICIPANT UNIFIED SIMULATION HEADER & STAGE NAVIGATOR
// Connects Team Dashboard, Canvas, Market, Crisis, Auction, Pitch, and Reveal
// =========================================================================

import React from 'react';
import { useSimulation } from '../services/simulationContext';
import { SimulationRole } from '../types';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Receipt,
  AlertTriangle,
  Gavel,
  Mic,
  Trophy,
  Coins,
  Clock,
  Shield,
  Briefcase,
  TrendingUp,
  Cpu,
  Megaphone,
} from 'lucide-react';

interface ParticipantNavHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  title?: string;
  subtitle?: string;
}

export const ParticipantNavHeader: React.FC<ParticipantNavHeaderProps> = ({
  currentView,
  onNavigate,
  title,
  subtitle,
}) => {
  const {
    currentTeam,
    currentRole,
    setCurrentRole,
    getBalance,
    eventStatus,
    serverTimeRemainingSeconds,
    activeCrisis,
  } = useSimulation();

  const balance = getBalance();

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navStages = [
    { id: 'team-dashboard', label: 'Team Hub', icon: LayoutDashboard },
    { id: 'canvas', label: 'Startup Canvas', icon: FileText },
    { id: 'market', label: 'Digital Market', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    {
      id: 'crisis',
      label: 'Crisis',
      icon: AlertTriangle,
      badge: activeCrisis && activeCrisis.status === 'ACTIVE' ? 'LIVE' : undefined,
      alert: activeCrisis && activeCrisis.status === 'ACTIVE',
    },
    { id: 'auction', label: 'Auction & Trade', icon: Gavel },
    { id: 'pitch', label: 'Pitch Deck', icon: Mic },
    { id: 'reveal', label: 'Results', icon: Trophy },
  ];

  return (
    <div className="w-full bg-[#FAF8F5] dark:bg-[#0C0E17] border-b border-[#EFE8DD] dark:border-[#1E2230] px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top Telemetry Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Team & Context */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
              {title || currentTeam.name}
            </h1>
            <span className="badge badge-orange font-mono text-[10px]">
              {currentTeam.teamCode}
            </span>
          </div>

          {subtitle && (
            <span className="text-xs text-stone-500 hidden sm:inline">
              • {subtitle}
            </span>
          )}
        </div>

        {/* Right: Balance, Clock & Role Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Virtual Capital Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>₹{balance.toLocaleString()}</span>
            <span className="text-[10px] text-stone-400 font-normal">Capital</span>
          </div>

          {/* Simulation Status & Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{eventStatus}</span>
            <span>•</span>
            <span className="text-orange-600 dark:text-orange-400 font-black">
              {formatTimer(serverTimeRemainingSeconds)}
            </span>
          </div>

          {/* Active Role Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200 dark:border-stone-800">
            {(['CEO', 'CFO', 'CTO', 'CMO'] as SimulationRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setCurrentRole(r)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  currentRole === r
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title={`Switch active perspective to ${r}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Connected Stage Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {navStages.map((stg) => {
          const Icon = stg.icon;
          const isActive = currentView === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => onNavigate(stg.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : stg.alert ? 'text-red-500 animate-pulse' : 'text-stone-400'}`} />
              <span>{stg.label}</span>
              {stg.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-red-500 text-white">
                  {stg.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
