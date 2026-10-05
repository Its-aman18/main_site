import React from 'react';
import {
  Trophy,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { zoStyles } from '../zeroOneTheme';
import type { SimulationState } from '../types';

interface ZeroOneFinalSummaryProps {
  simulationState: SimulationState;
  teamName: string;
  teamRank?: string;
  totalTeams?: number;
  onViewLeaderboard: () => void;
  onViewJourney: () => void;
}

export const ZeroOneFinalSummary: React.FC<ZeroOneFinalSummaryProps> = ({
  simulationState,
  teamName,
  teamRank = '#03',
  totalTeams = 42,
  onViewLeaderboard,
  onViewJourney,
}) => {
  const breakdown = simulationState.breakdown || {
    discover: 82,
    build: 91,
    validate: 76,
    grow: 88,
    scale: 94,
    finalScore: 86.2,
  };

  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Dramatic Victory Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-[#2B1408] via-[#1E0D05] to-[#120602] p-8 md:p-10 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        {/* Floating Trophy / Badge */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 p-0.5 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#140803] flex items-center justify-center">
              <Trophy className="w-12 h-12 text-amber-400 drop-shadow" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          SIMULATION CONCLUDED • MISSION COMPLETE
        </div>

        <h1 className="text-4xl md:text-5xl font-black font-mono text-stone-100 tracking-tight">
          ZERO → ONE
        </h1>

        <p className="text-sm md:text-base text-stone-300 max-w-xl mx-auto mt-2 font-mono">
          Squad <strong className="text-amber-400">{teamName}</strong> has piloted their venture through all 5 levels of development, market friction, and institutional scale.
        </p>

        {/* Big Rank Badge */}
        <div className="mt-8 inline-flex items-center gap-6 px-8 py-4 rounded-xl bg-[#140803]/90 border border-amber-500/30 shadow-inner">
          <div className="text-left">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              FINAL VENTURE STANDING
            </span>
            <span className="text-3xl md:text-4xl font-black font-mono text-amber-400 tracking-tight">
              {teamRank}
            </span>
            <span className="text-xs font-mono text-stone-400 block mt-0.5">
              OUT OF {totalTeams} SQUADS
            </span>
          </div>
          <div className="h-12 w-px bg-amber-950/80" />
          <div className="text-left">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              FINAL COMPOSITE SCORE
            </span>
            <span className="text-3xl md:text-4xl font-black font-mono text-emerald-400 tracking-tight">
              {breakdown.finalScore}
            </span>
            <span className="text-xs font-mono text-stone-400 block mt-0.5">
              / 100.0 MAXIMUM
            </span>
          </div>
        </div>
      </div>

      {/* Enterprise Valuation & Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 text-center">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">STARTUP VALUE</span>
          <div className="text-base md:text-lg font-bold font-mono text-amber-400 mt-1">
            {formatINR(simulationState.valuation || 120000000)}
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Post-Scale Base</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 text-center">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">CUSTOMERS</span>
          <div className="text-base md:text-lg font-bold font-mono text-stone-100 mt-1">
            {(simulationState.customers || 18500).toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-stone-400">Active Founders</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 text-center">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">MONTHLY REVENUE</span>
          <div className="text-base md:text-lg font-bold font-mono text-amber-300 mt-1">
            ₹6,80,000
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Unit Positive</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 text-center">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">CASH BUFFER</span>
          <div className="text-base md:text-lg font-bold font-mono text-emerald-400 mt-1">
            ₹24,50,000
          </div>
          <span className="text-[10px] font-mono text-stone-400">Runway Protected</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 text-center">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">MARKET SHARE</span>
          <div className="text-base md:text-lg font-bold font-mono text-cyan-400 mt-1">
            26%
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Category Lead</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 text-center">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">TEAM RATING</span>
          <div className="text-base md:text-lg font-bold font-mono text-amber-400 mt-1">
            9.2 / 10
          </div>
          <span className="text-[10px] font-mono text-stone-400">Auditorium Grade</span>
        </div>
      </div>

      {/* Performance Breakdown Radar Bars */}
      <div className="rounded-xl border border-amber-900/40 bg-[#160A05] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-950/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold font-mono text-stone-100 uppercase">
              MISSION PERFORMANCE BREAKDOWN
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400">Evaluated by VC & Alumni Jury</span>
        </div>

        <div className="space-y-3.5">
          {[
            { label: 'DISCOVER', subtitle: 'Problem Validation & Market TAM', score: breakdown.discover },
            { label: 'BUILD', subtitle: 'Capital Allocation & Feature Architecture', score: breakdown.build },
            { label: 'VALIDATE', subtitle: 'Customer Intercepts & Unit Economics', score: breakdown.validate },
            { label: 'GROW', subtitle: 'Traction Velocity & Crisis Resilience', score: breakdown.grow },
            { label: 'SCALE', subtitle: 'Capitalization Strategy & Pan-India Reach', score: breakdown.scale },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-stone-200 font-bold mr-2">{item.label}</span>
                  <span className="text-stone-500 text-[11px] hidden sm:inline">{item.subtitle}</span>
                </div>
                <span className="text-amber-400 font-bold">{item.score} / 100</span>
              </div>
              <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Actions & CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={onViewLeaderboard}
          className={`${zoStyles.btnPrimary} w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 text-xs`}
        >
          <Trophy className="w-4 h-4" />
          <span>VIEW LEADERBOARD</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onViewJourney}
          className={`${zoStyles.btnSecondary} w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 text-xs`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>VIEW STARTUP JOURNEY MAP</span>
        </button>
      </div>
    </div>
  );
};
