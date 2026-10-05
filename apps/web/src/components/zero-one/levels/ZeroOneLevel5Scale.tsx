import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Globe,
  Coins,
  Building,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { zoStyles } from '../zeroOneTheme';
import type { SimulationState } from '../types';

interface ZeroOneLevel5ScaleProps {
  simulationState: SimulationState;
  onUpdateState: (partial: Partial<SimulationState>) => void;
  onSubmitScale: () => void;
  isLocked?: boolean;
}

export const ZeroOneLevel5Scale: React.FC<ZeroOneLevel5ScaleProps> = ({
  simulationState,
  onUpdateState,
  onSubmitScale,
  isLocked = false,
}) => {
  const [fundingStrategy, setFundingStrategy] = useState<SimulationState['fundingStrategy']>(
    simulationState.fundingStrategy || 'VENTURE_CAPITAL'
  );
  const [marketExpansion, setMarketExpansion] = useState<SimulationState['marketExpansion']>(
    simulationState.marketExpansion || 'NATIONAL'
  );
  const [competitorResponse, setCompetitorResponse] = useState<SimulationState['scaleCompetitorResponse']>(
    simulationState.scaleCompetitorResponse || 'EXPAND_MARKET'
  );
  const [submitted, setSubmitted] = useState<boolean>(simulationState.level5Submitted);

  const handleSubmit = () => {
    setSubmitted(true);
    onUpdateState({
      fundingStrategy,
      marketExpansion,
      scaleCompetitorResponse: competitorResponse,
      level5Submitted: true,
      valuation: 120000000, // ₹12 Cr
      marketShare: 26,
      score: simulationState.score + 1250,
    });
    onSubmitScale();
  };

  if (isLocked) {
    return (
      <div className={`${zoStyles.card} text-center py-16 px-6`}>
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center mx-auto mb-4 text-amber-500/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-mono text-stone-200">MISSION 05 LOCKED</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Complete Level 04: Grow to unlock strategic scaling and capitalization decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-[#1E0F07] via-[#24130A] to-[#180B04] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              MISSION 05 • STRATEGIC EXPANSION & CAPITALIZATION
            </div>
            <h2 className="text-2xl font-bold font-mono text-stone-100 tracking-wide">
              SCALE: TAKE THE STARTUP FROM GROWTH TO SCALE
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              Select your equity capitalization model, execute regional market expansion, and defend market dominance against competitor mega-rounds.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#140904]/90 px-4 py-3 rounded-xl border border-amber-900/40 shrink-0">
            <div className="text-right">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Enterprise Value</span>
              <span className="text-base font-bold font-mono text-amber-400 flex items-center justify-end gap-1">
                <Award className="w-4 h-4" />
                {submitted ? '₹12.0 Cr' : '₹4.2 Cr'}
              </span>
            </div>
            <Rocket className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Enterprise Metrics Telemetry */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          ENTERPRISE SCALE RADAR
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">VALUATION</span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              {submitted ? '₹12,00,00,000' : '₹4,20,00,000'}
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              {submitted ? '3x Multiple' : 'Pre-Money Base'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">CUSTOMERS</span>
            <div className="text-lg font-bold font-mono text-stone-100 mt-0.5">
              18,500
            </div>
            <span className="text-[10px] font-mono text-stone-400">Campus Verified</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">MONTHLY REVENUE</span>
            <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
              ₹6,80,000
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Profitable Base</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">TREASURY CASH</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              ₹24,50,000
            </div>
            <span className="text-[10px] font-mono text-stone-400">Buffer Reserves</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">MARKET SHARE</span>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
              {submitted ? '26%' : '14%'}
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+12% Category Lead</span>
          </div>
        </div>
      </div>

      {/* Strategic Choices: Capitalization & Expansion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Choice 1: Capitalization Model */}
        <div className="rounded-xl border border-amber-950/70 bg-[#160A05] p-5 space-y-3">
          <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            1. FINANCING STRATEGY
          </span>

          {[
            {
              id: 'BOOTSTRAP' as const,
              label: 'Pure Bootstrapping',
              desc: 'Retain 100% founder equity. Expand organically from operating cash flows.',
              badge: 'Zero Dilution',
            },
            {
              id: 'ANGEL' as const,
              label: 'Angel Syndicate Round',
              desc: 'Raise ₹50 Lakhs from university alumni operators for 10% equity.',
              badge: 'Strategic Mentors',
            },
            {
              id: 'VENTURE_CAPITAL' as const,
              label: 'Institutional VC Seed Round',
              desc: 'Raise ₹2.5 Crore at ₹12 Crore valuation for aggressive pan-India blitz.',
              badge: 'Maximum Velocity',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setFundingStrategy(item.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                fundingStrategy === item.id
                  ? 'border-amber-400 bg-[#27140B] ring-1 ring-amber-400/40 text-stone-100 shadow-md'
                  : 'border-amber-950/70 bg-[#120703] hover:bg-[#1A0C06] text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-xs text-stone-200">{item.label}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Choice 2: Geographic Expansion */}
        <div className="rounded-xl border border-amber-950/70 bg-[#160A05] p-5 space-y-3">
          <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            2. MARKET EXPANSION RADIUS
          </span>

          {[
            {
              id: 'CITY' as const,
              label: 'City & Regional Dominance',
              desc: 'Concentrate across Meerut and Delhi-NCR universities to monopolize local density.',
              badge: 'High Moat',
            },
            {
              id: 'STATE' as const,
              label: 'State-wide Campus Rollout',
              desc: 'Expand to 45 engineering colleges across Uttar Pradesh technical university grid.',
              badge: '45 Campuses',
            },
            {
              id: 'NATIONAL' as const,
              label: 'Pan-India University Network',
              desc: 'Launch across Tier-1/2 technical institutes nationwide with ambassador hubs.',
              badge: 'National Reach',
            },
            {
              id: 'GLOBAL' as const,
              label: 'International Student Corridors',
              desc: 'Cross-border pilot in South Asian universities with remote cross-currency support.',
              badge: 'Global Frontier',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setMarketExpansion(item.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                marketExpansion === item.id
                  ? 'border-amber-400 bg-[#27140B] ring-1 ring-amber-400/40 text-stone-100 shadow-md'
                  : 'border-amber-950/70 bg-[#120703] hover:bg-[#1A0C06] text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-xs text-stone-200">{item.label}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Major Strategic Event: Competitor Raises ₹5 Crore */}
      <div className="rounded-xl border border-red-500/30 bg-[#1E0B05] p-5 space-y-4">
        <div className="border-b border-red-950/70 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            MAJOR STRATEGIC EVENT • RIVAL SYNDICATE RAISES ₹5 CRORE
          </div>
          <p className="text-xs text-stone-300 mt-1 font-mono leading-relaxed">
            A venture-backed competitor has closed ₹5 Crore in institutional funding to aggressively buy campus market share with aggressive subsidies. How does your squad respond?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'RAISE_FUNDING' as const,
              label: 'RAISE FUNDING',
              sub: 'Fast-track institutional round to counter-match capital firepower.',
            },
            {
              id: 'EXPAND_MARKET' as const,
              label: 'EXPAND MARKET',
              sub: 'Leapfrog to unserved national colleges where rival has zero footprint.',
            },
            {
              id: 'DEFEND_MARKET' as const,
              label: 'DEFEND MARKET',
              sub: 'Lock in university administration agreements and exclusive student club deals.',
            },
            {
              id: 'ACQUIRE_COMPETITOR' as const,
              label: 'ACQUIRE / MERGE',
              sub: 'Propose merger of equals to unite technical power and avoid margin erosion.',
            },
          ].map((resp) => {
            const isSelected = competitorResponse === resp.id;
            return (
              <div
                key={resp.id}
                onClick={() => setCompetitorResponse(resp.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-[#2F150B] ring-1 ring-amber-400/40 text-stone-100 shadow-md'
                    : 'border-amber-950/70 bg-[#140804] hover:bg-[#1A0B05] text-stone-400'
                }`}
              >
                <div className="font-bold font-mono text-xs text-amber-300 mb-1">{resp.label}</div>
                <div className="text-[11px] text-stone-400 leading-snug">{resp.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scale Verdict & Completion */}
      <div className="rounded-xl border border-amber-900/40 bg-[#160A05] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/60">
          <div>
            <span className="text-xs font-mono text-stone-400 uppercase">Scale Strategy Verdict</span>
            <div className="text-sm font-bold font-mono text-stone-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              Financing: {fundingStrategy} | Radius: {marketExpansion} | Rival Counter: {competitorResponse}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-stone-400 block text-[10px]">SCALE REWARD</span>
              <span className="text-emerald-400 font-bold text-sm">+1,250 XP</span>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              SCALE ARCHITECTURE CONFIRMED • VENTURE READY FOR AUDITORIUM JURY
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              Your strategy took the enterprise valuation to <strong className="text-amber-300">₹12.0 Crore</strong> with <strong className="text-amber-300">26% market share</strong>. You have unlocked the ultimate stage: <strong className="text-amber-400">ZERO → ONE GRAND AUDITORIUM DEFENSE</strong>!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-stone-400">
              Lock in your scale strategy to submit to Mission Control and unlock the Grand Finale.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className={`${zoStyles.btnPrimary} text-xs py-2.5 px-6 shrink-0 flex items-center justify-center gap-2`}
            >
              <Sparkles className="w-4 h-4" />
              <span>SUBMIT SCALE STRATEGY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
