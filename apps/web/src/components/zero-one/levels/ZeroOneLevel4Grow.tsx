import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Users,
  Flame,
  AlertTriangle,
  Server,
  UserX,
  ShieldAlert,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { zoStyles } from '../zeroOneTheme';
import type { SimulationState } from '../types';

interface ZeroOneLevel4GrowProps {
  simulationState: SimulationState;
  onUpdateState: (partial: Partial<SimulationState>) => void;
  onSubmitGrow: () => void;
  isLocked?: boolean;
}

interface CrisisEvent {
  id: 'COMPETITOR' | 'SERVER' | 'TALENT';
  title: string;
  badge: string;
  description: string;
  options: {
    id: string;
    label: string;
    consequence: string;
    metricImpact: string;
  }[];
}

const CRISIS_EVENTS: CrisisEvent[] = [
  {
    id: 'COMPETITOR',
    title: 'COMPETITOR ALERT: RIVAL COPIES CORE FEATURE',
    badge: 'HIGH PRIORITY THREAT',
    description:
      'A well-funded campus rival has launched a copycat tool offering discount vouchers and aggressive poster campaigns.',
    options: [
      {
        id: 'opt-improve',
        label: 'Accelerate Product & AI Moat',
        consequence: 'Outpaced competitor on speed and reliability; customer satisfaction jumped to 82/100.',
        metricImpact: '+280 New Users, +15% Retention',
      },
      {
        id: 'opt-mktg',
        label: 'Double Marketing & Campus Blitz',
        consequence: 'Won top-of-mind recall across hostels; increased burn rate by ₹25,000/mo.',
        metricImpact: '+450 Users, -₹25,000 Runway',
      },
      {
        id: 'opt-price',
        label: 'Slash Fees to Undercut',
        consequence: 'Sparked margin compression across the campus ecosystem.',
        metricImpact: '+120 Users, -20% Margin',
      },
      {
        id: 'opt-ignore',
        label: 'Ignore & Double Down on Execution',
        consequence: 'Rival exhausted their initial marketing budget in 3 weeks and lost engagement.',
        metricImpact: 'Steady Growth, Zero Burn',
      },
    ],
  },
  {
    id: 'SERVER',
    title: 'CRITICAL INFRASTRUCTURE: DB OVERLOAD OUTAGE',
    badge: 'SYSTEM CRISIS',
    description:
      'Core database crashed during peak semester exams with 600 concurrent students online. Users are tweeting issues.',
    options: [
      {
        id: 'opt-edge',
        label: 'Deploy Redundant Multi-AZ Edge Nodes',
        consequence: 'System restored in 6 minutes with 99.99% SLA; team established DevOps prestige.',
        metricImpact: '99.99% Uptime, -₹15,000 Cost',
      },
      {
        id: 'opt-credit',
        label: 'Issue Goodwill Credits & Apology Email',
        consequence: 'Users appreciated extreme transparency; churn rate dropped to zero.',
        metricImpact: '+8 CSAT, -₹10,000 Credit',
      },
      {
        id: 'opt-hotfix',
        label: 'Quick Internal Monolith Patch',
        consequence: 'Fixed immediate crash with no spend, but technical debt remains.',
        metricImpact: '₹0 Cost, Technical Debt +15%',
      },
    ],
  },
  {
    id: 'TALENT',
    title: 'TALENT AT RISK: LEAD DEVELOPER POACHED',
    badge: 'HUMAN CAPITAL',
    description:
      'Your lead backend engineer received a high-stipend off-campus internship offer starting next week.',
    options: [
      {
        id: 'opt-equity',
        label: 'Grant 2.5% Founder Equity Vested',
        consequence: 'Lead engineer committed full-time as co-founder with aligned long-term stakes.',
        metricImpact: 'Co-founder Locked, 0 Cash Drain',
      },
      {
        id: 'opt-recruit',
        label: 'Recruit Junior Talent from Club',
        consequence: 'Brought in two eager 2nd-year developers; 1 week code review ramp-up.',
        metricImpact: '+2 Engineers, -₹8,000 Stipend',
      },
      {
        id: 'opt-absorb',
        label: 'Absorb Codebase Across Existing Team',
        consequence: 'High late-night crunch hours; team velocity sustained without new hires.',
        metricImpact: '0 Burn, Fatigue Warning',
      },
    ],
  },
];

export const ZeroOneLevel4Grow: React.FC<ZeroOneLevel4GrowProps> = ({
  simulationState,
  onUpdateState,
  onSubmitGrow,
  isLocked = false,
}) => {
  const [activeCrisisId, setActiveCrisisId] = useState<CrisisEvent['id']>(
    simulationState.activeCrisisId || 'COMPETITOR'
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    simulationState.crisisChoice || 'opt-improve'
  );
  const [resolved, setResolved] = useState<boolean>(simulationState.level4Submitted);

  const activeCrisis =
    CRISIS_EVENTS.find((c) => c.id === activeCrisisId) || CRISIS_EVENTS[0];
  const selectedChoice = activeCrisis.options.find((o) => o.id === selectedChoiceId);

  const handleResolveCrisis = () => {
    setResolved(true);
    onUpdateState({
      activeCrisisId,
      crisisChoice: selectedChoiceId,
      level4Submitted: true,
      customers: simulationState.customers + 380,
      revenue: simulationState.revenue + 45000,
      score: simulationState.score + 1000,
    });
    onSubmitGrow();
  };

  if (isLocked) {
    return (
      <div className={`${zoStyles.card} text-center py-16 px-6`}>
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center mx-auto mb-4 text-amber-500/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-mono text-stone-200">MISSION 04 LOCKED</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Complete Level 03: Validate to unlock customer growth telemetry and crisis simulations.
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
              MISSION 04 • TRACTION ENGINE & CRISIS SURVIVAL
            </div>
            <h2 className="text-2xl font-bold font-mono text-stone-100 tracking-wide">
              GROW: SCALE USERS & SURVIVE MARKET SHOCKS
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              Scale active customer acquisition while managing monthly burn rate and successfully deflecting live competitor alerts.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#140904]/90 px-4 py-3 rounded-xl border border-amber-900/40 shrink-0">
            <div className="text-right">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Active Founders</span>
              <span className="text-base font-bold font-mono text-amber-400 flex items-center justify-end gap-1">
                <Users className="w-4 h-4" />
                {simulationState.customers.toLocaleString()}
              </span>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Live Operational Metrics Board */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          SQUAD OPERATIONAL TELEMETRY
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">CUSTOMERS</span>
            <div className="text-lg font-bold font-mono text-stone-100 mt-0.5">
              {simulationState.customers.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+28% MoM</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">REVENUE</span>
            <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
              ₹{(simulationState.revenue / 100000).toFixed(2)}L /mo
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+50% Growth</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">BURN RATE</span>
            <div className="text-lg font-bold font-mono text-orange-400 mt-0.5">
              ₹{(simulationState.burnRate / 1000).toFixed(0)}k /mo
            </div>
            <span className="text-[10px] font-mono text-stone-400">11.5 Mo Runway</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">MARKETING</span>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
              ₹35,000 /mo
            </div>
            <span className="text-[10px] font-mono text-stone-400">CAC ₹24/user</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">TEAM SIZE</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              6 Founders
            </div>
            <span className="text-[10px] font-mono text-stone-400">Engineering & Growth</span>
          </div>
        </div>
      </div>

      {/* Random Crisis Events System */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            MARKET ALERT & CRISIS SIMULATOR
          </h3>
          <span className="text-xs font-mono text-orange-400">Choose crisis to resolve</span>
        </div>

        {/* Crisis Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CRISIS_EVENTS.map((crisis) => {
            const isCrisisActive = activeCrisisId === crisis.id;
            return (
              <button
                type="button"
                key={crisis.id}
                onClick={() => {
                  setActiveCrisisId(crisis.id);
                  setSelectedChoiceId(crisis.options[0]?.id || null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isCrisisActive
                    ? 'border-orange-500/80 bg-[#2C140A] ring-1 ring-orange-500/40 text-stone-100 shadow-lg'
                    : 'border-amber-950/70 bg-[#160A05]/80 hover:bg-[#1C0E07] text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {crisis.badge}
                  </span>
                  {crisis.id === 'COMPETITOR' && <Target className="w-4 h-4 text-orange-400" />}
                  {crisis.id === 'SERVER' && <Server className="w-4 h-4 text-red-400" />}
                  {crisis.id === 'TALENT' && <UserX className="w-4 h-4 text-yellow-400" />}
                </div>
                <div className="text-xs font-bold font-mono line-clamp-1">{crisis.title}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Crisis Card & Decisions */}
        <div className="rounded-xl border border-orange-500/30 bg-[#1D0C06] p-5 space-y-4">
          <div className="border-b border-amber-950/70 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase">
              <Flame className="w-4 h-4" />
              {activeCrisis.title}
            </div>
            <p className="text-xs text-stone-300 mt-1 font-mono leading-relaxed">
              {activeCrisis.description}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-stone-400 uppercase block font-bold">
              Available Strategic Counter-Measures:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCrisis.options.map((opt) => {
                const isSelected = selectedChoiceId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedChoiceId(opt.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-[#2D160B] ring-1 ring-amber-400/40 text-stone-100 shadow-md'
                        : 'border-amber-950/70 bg-[#140804] hover:bg-[#1A0B05] text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs text-stone-200">
                        {opt.label}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500 text-stone-950 font-bold'
                            : 'border-stone-700 bg-stone-900 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-400 leading-snug">{opt.consequence}</div>
                    <div className="mt-2 text-[10px] font-mono text-amber-400 font-bold">
                      Impact: {opt.metricImpact}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Summary */}
      <div className="rounded-xl border border-amber-900/40 bg-[#160A05] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/60">
          <div>
            <span className="text-xs font-mono text-stone-400 uppercase">Strategic Response Verdict</span>
            <div className="text-sm font-bold font-mono text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {selectedChoice ? selectedChoice.label : 'Select a counter-measure above'}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-stone-400 block text-[10px]">TRACTION REWARD</span>
              <span className="text-emerald-400 font-bold text-sm">+1,000 XP</span>
            </div>
          </div>
        </div>

        {resolved ? (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              MARKET CRISIS DEFENDED • SQUAD ADVANCES
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              Your decisive action on <strong className="text-amber-300">{activeCrisis.title}</strong> neutralized the shockwave. Customer count expanded to <strong className="text-amber-300">{(simulationState.customers + 380).toLocaleString()}</strong> and monthly revenue reached <strong className="text-amber-300">₹2.25L</strong>. You have unlocked <strong className="text-amber-400">LEVEL 05: SCALE</strong>!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-stone-400">
              Lock in your tactical counter-measure to defuse the market threat and unlock Level 05: Scale.
            </p>
            <button
              type="button"
              onClick={handleResolveCrisis}
              disabled={!selectedChoiceId}
              className={`${zoStyles.btnPrimary} text-xs py-2.5 px-6 shrink-0 flex items-center justify-center gap-2 disabled:opacity-40`}
            >
              <span>SUBMIT CRISIS RESOLUTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
