import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Coins,
  Cpu,
  Layers,
  Megaphone,
  Users2,
  Settings2,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react';
import { zoStyles } from '../zeroOneTheme';
import type { SimulationState } from '../types';

interface ZeroOneLevel2BuildProps {
  simulationState: SimulationState;
  onUpdateState: (partial: Partial<SimulationState>) => void;
  onSubmitBuild: () => void;
  isLocked?: boolean;
}

const TOTAL_STARTING_CAPITAL = 1000000; // ₹10,00,000

interface FeatureOption {
  id: keyof SimulationState['features'];
  name: string;
  tag: 'CORE' | 'EXPANSION' | 'SCALE';
  cost: number;
  description: string;
  impact: string;
}

const FEATURES: FeatureOption[] = [
  {
    id: 'auth',
    name: 'Student ID Authentication & Verification',
    tag: 'CORE',
    cost: 100000,
    description: 'OAuth2 with university email validation to eliminate bot spam.',
    impact: '+40% User Trust',
  },
  {
    id: 'productListing',
    name: 'Interactive Product Listing & Search Index',
    tag: 'CORE',
    cost: 150000,
    description: 'Instant search, category tagging, and geo-filtered campus listings.',
    impact: '+65% Catalog Discovery',
  },
  {
    id: 'aiRecommendation',
    name: 'AI Smart Recommendation Engine',
    tag: 'EXPANSION',
    cost: 200000,
    description: 'Algorithmic matching based on semester courses and peer demand.',
    impact: '+22% Basket Size',
  },
  {
    id: 'analytics',
    name: 'Advanced Conversion Analytics Suite',
    tag: 'EXPANSION',
    cost: 100000,
    description: 'Real-time telemetry on drop-offs, search queries, and retention.',
    impact: '+18% Optimization Velocity',
  },
  {
    id: 'mobileApp',
    name: 'Native Mobile App (Android & iOS)',
    tag: 'SCALE',
    cost: 250000,
    description: 'Push notifications and offline camera capture for instant uploads.',
    impact: '+35% Daily Active Usage',
  },
];

export const ZeroOneLevel2Build: React.FC<ZeroOneLevel2BuildProps> = ({
  simulationState,
  onUpdateState,
  onSubmitBuild,
  isLocked = false,
}) => {
  const [budget, setBudget] = useState(simulationState.budget);
  const [features, setFeatures] = useState(simulationState.features);
  const [showConsequence, setShowConsequence] = useState<boolean>(simulationState.level2Submitted);

  const totalAllocated =
    budget.product + budget.technology + budget.marketing + budget.team + budget.operations;
  const remainingCapital = TOTAL_STARTING_CAPITAL - totalAllocated;

  const handleAdjustBudget = (category: keyof typeof budget, delta: number) => {
    const current = budget[category];
    const next = Math.max(0, current + delta);
    const newTotal = totalAllocated - current + next;
    if (newTotal > TOTAL_STARTING_CAPITAL && delta > 0) {
      return; // Cannot exceed ₹10L
    }
    const newBudget = { ...budget, [category]: next };
    setBudget(newBudget);
    onUpdateState({ budget: newBudget, capital: TOTAL_STARTING_CAPITAL - newTotal });
  };

  const handleToggleFeature = (id: keyof typeof features) => {
    const newFeatures = { ...features, [id]: !features[id] };
    setFeatures(newFeatures);
    onUpdateState({ features: newFeatures });
  };

  const handleSubmit = () => {
    setShowConsequence(true);
    onUpdateState({
      budget,
      features,
      level2Submitted: true,
      capital: remainingCapital > 0 ? remainingCapital : 750000,
      score: simulationState.score + 500,
    });
    onSubmitBuild();
  };

  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  if (isLocked) {
    return (
      <div className={`${zoStyles.card} text-center py-16 px-6`}>
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center mx-auto mb-4 text-amber-500/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-mono text-stone-200">MISSION 02 LOCKED</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Complete Level 01: Discover and receive Mission Control approval to unlock MVP Build.
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
              MISSION 02 • ARCHITECTURE & MVP ALLOCATION
            </div>
            <h2 className="text-2xl font-bold font-mono text-stone-100 tracking-wide">
              BUILD: TURN INTEL INTO WORKING PRODUCT
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              You are granted <strong className="text-amber-300">₹10,00,000 Starting Runway</strong>. Allocate capital across your 5 core departments and prioritize features within strict resource limits.
            </p>
          </div>

          <div className="bg-[#140904]/90 p-4 rounded-xl border border-amber-900/40 min-w-[200px] shrink-0">
            <div className="text-xs font-mono text-stone-400 uppercase flex items-center justify-between">
              <span>Capital Runway</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
              {formatINR(remainingCapital)}
            </div>
            <div className="text-[10px] font-mono text-stone-400 mt-1 flex justify-between">
              <span>Allocated: {formatINR(totalAllocated)}</span>
              <span>Total: ₹10L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capital Allocation Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold">
              1
            </span>
            CAPITAL ALLOCATION MATRIX (₹10,00,000 MAX)
          </h3>
          <span className="text-xs font-mono text-stone-400">Step: ₹25,000 / click</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { key: 'product' as const, label: 'PRODUCT', icon: Layers, val: budget.product, color: 'text-amber-400' },
            { key: 'technology' as const, label: 'TECHNOLOGY', icon: Cpu, val: budget.technology, color: 'text-cyan-400' },
            { key: 'marketing' as const, label: 'MARKETING', icon: Megaphone, val: budget.marketing, color: 'text-orange-400' },
            { key: 'team' as const, label: 'TEAM & TALENT', icon: Users2, val: budget.team, color: 'text-emerald-400' },
            { key: 'operations' as const, label: 'OPERATIONS', icon: Settings2, val: budget.operations, color: 'text-yellow-400' },
          ].map((cat) => {
            const Icon = cat.icon;
            const pct = Math.round((cat.val / TOTAL_STARTING_CAPITAL) * 100);
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-stone-300 mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-stone-400">{pct}%</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-stone-100 mb-2">
                    {formatINR(cat.val)}
                  </div>
                  <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustBudget(cat.key, -25000)}
                    disabled={cat.val <= 0}
                    className="flex-1 py-1.5 px-2 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-200 border border-stone-800 flex items-center justify-center text-xs font-mono"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustBudget(cat.key, 25000)}
                    disabled={remainingCapital < 25000}
                    className="flex-1 py-1.5 px-2 rounded bg-amber-600/30 hover:bg-amber-600/50 disabled:opacity-30 text-amber-300 border border-amber-600/40 flex items-center justify-center text-xs font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Feature Prioritization Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold">
              2
            </span>
            MVP FEATURE PRIORITIZATION
          </h3>
          <span className="text-xs font-mono text-amber-400">
            Selected: {Object.values(features).filter(Boolean).length} / {FEATURES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((feat) => {
            const isChecked = features[feat.id];
            return (
              <div
                key={feat.id}
                onClick={() => handleToggleFeature(feat.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isChecked
                    ? 'border-amber-400 bg-[#25130A] ring-1 ring-amber-400/40 shadow-md'
                    : 'border-amber-950/60 bg-[#160A05]/80 hover:bg-[#1C0E07]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                      feat.tag === 'CORE'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : feat.tag === 'EXPANSION'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {feat.tag}
                  </span>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border text-xs transition-colors ${
                      isChecked
                        ? 'border-amber-400 bg-amber-500 text-stone-950 font-bold'
                        : 'border-stone-700 bg-stone-900 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>

                <div className="font-bold text-stone-100 text-sm font-mono mb-1">{feat.name}</div>
                <p className="text-xs text-stone-400 line-clamp-2 mb-3 leading-snug">
                  {feat.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-amber-950/60">
                  <span className="text-amber-400 font-bold">{formatINR(feat.cost)}</span>
                  <span className="text-emerald-400">{feat.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Summary & Consequences */}
      <div className="rounded-xl border border-amber-900/40 bg-[#160A05] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/60">
          <div>
            <span className="text-xs font-mono text-stone-400 uppercase">Architecture Telemetry</span>
            <div className="text-sm font-bold font-mono text-stone-200 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Allocated: {formatINR(totalAllocated)} | Remaining Runway: {formatINR(remainingCapital)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-stone-400 block text-[10px]">ACTIVE SCOPE</span>
              <span className="text-amber-400 font-bold text-sm">
                {Object.values(features).filter(Boolean).length} Modules Built
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">MISSION REWARD</span>
              <span className="text-emerald-400 font-bold text-sm">+500 XP</span>
            </div>
          </div>
        </div>

        {remainingCapital < 0 ? (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-300 text-xs font-mono">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <span>Over-budget warning! Total allocation exceeds the ₹10,00,000 startup runway limit.</span>
          </div>
        ) : showConsequence ? (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              MVP ARCHITECTURE DEPLOYED SUCCESSFULLY
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              Your squad deployed core modules with <strong className="text-amber-300">{formatINR(totalAllocated)}</strong> capital deployed and <strong className="text-amber-300">{formatINR(remainingCapital)}</strong> buffer runway remaining. Initial alpha load tests yielded sub-80ms response times. You have unlocked <strong className="text-amber-400">LEVEL 03: VALIDATE</strong>!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-stone-400">
              Submit your MVP resource distribution and module priorities to deploy and unlock Level 03.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={remainingCapital < 0}
              className={`${zoStyles.btnPrimary} text-xs py-2.5 px-6 shrink-0 flex items-center justify-center gap-2 disabled:opacity-40`}
            >
              <span>SUBMIT MVP ARCHITECTURE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
