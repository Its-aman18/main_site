import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  Users,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { zoStyles } from '../zeroOneTheme';
import type { SimulationState } from '../types';

interface ZeroOneLevel1DiscoverProps {
  simulationState: SimulationState;
  onUpdateState: (partial: Partial<SimulationState>) => void;
  onSubmitDiscovery: () => void;
  isLocked?: boolean;
}

interface ProblemCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  targetUser: string;
  tam: string;
  validationScore: number;
}

const PROBLEMS: ProblemCard[] = [
  {
    id: 'prob-a',
    tag: 'CAMPUS COMMERCE',
    title: 'Problem A: Student Peer-to-Peer Marketplace',
    description:
      'Campus students struggle to find affordable second-hand textbooks, electronics, and lab equipment from trusted peers.',
    targetUser: '18,000+ university undergraduates & hostelites',
    tam: '₹2.4 Crore regional campus spend / year',
    validationScore: 84,
  },
  {
    id: 'prob-b',
    tag: 'AGRITECH AI',
    title: 'Problem B: Local Crop Disease Diagnosis',
    description:
      'Local smallholder farmers lose up to 35% crop yield because they lack accessible real-time identification of early plant diseases.',
    targetUser: '45,000+ peri-urban and rural farm holdings in Western UP',
    tam: '₹14 Crore agricultural protection market',
    validationScore: 92,
  },
  {
    id: 'prob-c',
    tag: 'EDTECH & GIGS',
    title: 'Problem C: Micro-Skill Campus Gig Economy',
    description:
      'Tier 2/3 engineering students lack structured access to paid local micro-freelance gigs and industry portfolio projects.',
    targetUser: '120,000+ technical college students across state universities',
    tam: '₹8.5 Crore gig stipend ecosystem',
    validationScore: 78,
  },
];

export const ZeroOneLevel1Discover: React.FC<ZeroOneLevel1DiscoverProps> = ({
  simulationState,
  onUpdateState,
  onSubmitDiscovery,
  isLocked = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    simulationState.selectedProblemId || 'prob-b'
  );
  const [researchFocus, setResearchFocus] = useState<'CUSTOMER' | 'MARKET' | 'COMPETITION' | 'OPPORTUNITY'>(
    simulationState.discoverResearchFocus || 'CUSTOMER'
  );
  const [showConsequence, setShowConsequence] = useState<boolean>(simulationState.level1Submitted);

  const selectedProblem = PROBLEMS.find((p) => p.id === selectedId) || PROBLEMS[1];

  const handleSelectProblem = (id: string) => {
    setSelectedId(id);
    onUpdateState({ selectedProblemId: id });
  };

  const handleSelectFocus = (focus: 'CUSTOMER' | 'MARKET' | 'COMPETITION' | 'OPPORTUNITY') => {
    setResearchFocus(focus);
    onUpdateState({ discoverResearchFocus: focus });
  };

  const handleSubmit = () => {
    setShowConsequence(true);
    onUpdateState({
      selectedProblemId: selectedId,
      discoverResearchFocus: researchFocus,
      level1Submitted: true,
      score: simulationState.score + 250,
      researchPoints: 95,
    });
    onSubmitDiscovery();
  };

  if (isLocked) {
    return (
      <div className={`${zoStyles.card} text-center py-16 px-6`}>
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center mx-auto mb-4 text-amber-500/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-mono text-stone-200">MISSION 01 LOCKED</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Mission Control has not yet initiated the Discover phase. Await round opening signal.
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
              MISSION 01 • GENESIS & PROBLEM DISCOVERY
            </div>
            <h2 className="text-2xl font-bold font-mono text-stone-100 tracking-wide">
              DISCOVER: FIND A PROBLEM WORTH SOLVING
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              &quot;Every startup begins with a problem.&quot; Evaluate real market friction points, allocate strategic research focus, and establish customer validation before deploying capital.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center bg-[#140904]/80 px-4 py-2.5 rounded-lg border border-amber-900/40">
            <div className="text-right">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Research Intel</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {simulationState.researchPoints} / 100 PTS
              </span>
            </div>
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Step 1: Select Problem Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold">
              1
            </span>
            SELECT PROBLEM VECTOR
          </h3>
          <span className="text-xs font-mono text-stone-400">Choose 1 of 3 vetted market opportunities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROBLEMS.map((prob) => {
            const isSelected = selectedId === prob.id;
            return (
              <div
                key={prob.id}
                onClick={() => handleSelectProblem(prob.id)}
                className={`relative rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-amber-400 bg-[#2A160D] shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                    : 'border-amber-950/60 bg-[#1A0D07]/80 hover:border-amber-700/60 hover:bg-[#201009]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                    {prob.tag}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500 text-stone-950 font-bold'
                        : 'border-stone-600 bg-stone-900/60 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>

                <h4 className="font-bold text-stone-100 text-base mb-2 font-mono leading-snug">
                  {prob.title}
                </h4>
                <p className="text-xs text-stone-300 line-clamp-3 mb-4 leading-relaxed">
                  {prob.description}
                </p>

                <div className="pt-3 border-t border-amber-950/60 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-stone-400">
                    <span>Target Group:</span>
                    <span className="text-stone-200 font-medium truncate max-w-[140px] text-right">
                      {prob.targetUser}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>TAM Estimate:</span>
                    <span className="text-amber-400 font-bold">{prob.tam}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-400 pt-1">
                    <span>Feasibility:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${prob.validationScore}%` }}
                        />
                      </div>
                      <span className="text-stone-300 font-bold">{prob.validationScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Research Pillars (Customer, Market, Competition, Opportunity) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold">
              2
            </span>
            STRATEGIC VALIDATION PILLAR
          </h3>
          <span className="text-xs font-mono text-amber-400">Selected: {researchFocus}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'CUSTOMER',
              label: 'CUSTOMER',
              icon: Users,
              desc: 'Deep interviews with 30+ early adopters to map pain points.',
              metric: '+25% Persona Fit',
            },
            {
              id: 'MARKET',
              label: 'MARKET',
              icon: TrendingUp,
              desc: 'Macro TAM/SAM data analysis & willingness-to-pay surveys.',
              metric: '+30% TAM Clarity',
            },
            {
              id: 'COMPETITION',
              label: 'COMPETITION',
              icon: Target,
              desc: 'Teardown of alternative solutions & feature moat definition.',
              metric: '+20% Moat Defense',
            },
            {
              id: 'OPPORTUNITY',
              label: 'OPPORTUNITY',
              icon: Sparkles,
              desc: 'Viral distribution levers and unit economic feasibility.',
              metric: '+15% Launch Speed',
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            const isPillarSelected = researchFocus === pillar.id;
            return (
              <button
                type="button"
                key={pillar.id}
                onClick={() => handleSelectFocus(pillar.id as any)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isPillarSelected
                    ? 'border-amber-400 bg-[#2A160D] ring-1 ring-amber-400/40 text-stone-100 shadow-md'
                    : 'border-amber-950/60 bg-[#160A05]/80 hover:bg-[#1E0F07] text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className={`w-5 h-5 ${
                      isPillarSelected ? 'text-amber-400' : 'text-stone-400'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-amber-400/90 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {pillar.metric}
                  </span>
                </div>
                <div className="font-mono font-bold text-sm text-stone-100 mb-1">{pillar.label}</div>
                <p className="text-[11px] text-stone-400 leading-snug">{pillar.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decision Summary & Consequences */}
      <div className="rounded-xl border border-amber-900/40 bg-[#160A05] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/60">
          <div>
            <span className="text-xs font-mono text-stone-400 uppercase">Selected Startup Thesis</span>
            <div className="text-base font-bold font-mono text-amber-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              {selectedProblem.title}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-stone-400 block text-[10px]">RESEARCH POINTS</span>
              <span className="text-amber-400 font-bold text-sm">85 → 95 PTS</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">DECISION SCORE</span>
              <span className="text-emerald-400 font-bold text-sm">+250 XP</span>
            </div>
          </div>
        </div>

        {showConsequence ? (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              DISCOVERY VALIDATION CONFIRMED BY MISSION CONTROL
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              Your squad targeted <strong className="text-amber-300">{selectedProblem.title}</strong> with primary research on <strong className="text-amber-300">{researchFocus}</strong>. Initial student and market interviews verified an 88% willingness-to-adopt score. You have unlocked <strong className="text-amber-400">LEVEL 02: BUILD</strong> and ₹10,00,000 initial startup runway!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-stone-400">
              Submit your discovery thesis to lock in research score and unlock Level 02: Build.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className={`${zoStyles.btnPrimary} text-xs py-2.5 px-6 shrink-0 flex items-center justify-center gap-2`}
            >
              <span>SUBMIT DISCOVERY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
