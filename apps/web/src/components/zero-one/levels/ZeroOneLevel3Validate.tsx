import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquareQuote,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BarChart3,
  Percent,
  Coins,
  Smile,
  Eye,
} from 'lucide-react';
import { zoStyles } from '../zeroOneTheme';
import type { SimulationState } from '../types';

interface ZeroOneLevel3ValidateProps {
  simulationState: SimulationState;
  onUpdateState: (partial: Partial<SimulationState>) => void;
  onSubmitValidate: () => void;
  isLocked?: boolean;
}

const FEEDBACK_ITEMS = [
  {
    author: 'Aarav Mehta',
    role: '3rd Year CSE Hostelite',
    quote: 'Interesting product, but the upfront price is too high for a student budget.',
    tag: 'PRICING FRICTION',
  },
  {
    author: 'Neha Verma',
    role: 'Campus Club President',
    quote: 'Would use this on daily basis if peer delivery was guaranteed within 2 hours.',
    tag: 'LOGISTICS LATENCY',
  },
  {
    author: 'Dr. R.K. Sharma',
    role: 'Faculty Advisor',
    quote: 'Not sure why students should switch from WhatsApp groups without verification.',
    tag: 'TRUST & POSITIONING',
  },
];

export const ZeroOneLevel3Validate: React.FC<ZeroOneLevel3ValidateProps> = ({
  simulationState,
  onUpdateState,
  onSubmitValidate,
  isLocked = false,
}) => {
  const [priceModel, setPriceModel] = useState<SimulationState['priceModel']>(
    simulationState.priceModel || 'LOW'
  );
  const [marketingChannel, setMarketingChannel] = useState<SimulationState['marketingChannel']>(
    simulationState.marketingChannel || 'CAMPUS_AMBASSADORS'
  );
  const [targetSegment, setTargetSegment] = useState<SimulationState['targetSegment']>(
    simulationState.targetSegment || 'STUDENTS'
  );
  const [simulated, setSimulated] = useState<boolean>(simulationState.level3Submitted);

  const handleSimulate = () => {
    setSimulated(true);
    onUpdateState({
      priceModel,
      marketingChannel,
      targetSegment,
      level3Submitted: true,
      satisfaction: 74,
      conversionRate: 19,
      revenue: 180000,
      score: simulationState.score + 750,
    });
    onSubmitValidate();
  };

  if (isLocked) {
    return (
      <div className={`${zoStyles.card} text-center py-16 px-6`}>
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center mx-auto mb-4 text-amber-500/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-mono text-stone-200">MISSION 03 LOCKED</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Complete Level 02: Build to test your MVP with simulated campus customers.
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
              MISSION 03 • MARKET FEEDBACK & METRIC CONSEQUENCE
            </div>
            <h2 className="text-2xl font-bold font-mono text-stone-100 tracking-wide">
              VALIDATE: TEST WHETHER THE STARTUP ACTUALLY WORKS
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              Listen to simulated customer critiques, calibrate pricing and distribution levers, and observe real-time market consequence feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#140904]/90 px-4 py-3 rounded-xl border border-amber-900/40 shrink-0">
            <div className="text-right">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Conversion Velocity</span>
              <span className="text-base font-bold font-mono text-emerald-400 flex items-center justify-end gap-1">
                <TrendingUp className="w-4 h-4" />
                {simulated ? '19%' : '12%'}
              </span>
            </div>
            <Users className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Simulated Customer Feedback Radar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-amber-400" />
            LIVE CUSTOMER FEEDBACK INTERCEPTS
          </h3>
          <span className="text-xs font-mono text-stone-400">3 critical user quotes detected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FEEDBACK_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-amber-950/70 bg-[#1A0D07]/90 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                  {item.tag}
                </span>
                <p className="text-xs text-stone-200 mt-2 font-mono italic leading-relaxed">
                  &quot;{item.quote}&quot;
                </p>
              </div>
              <div className="pt-2 border-t border-amber-950/60 text-[10px] font-mono text-stone-400">
                <span className="text-stone-300 font-bold block">{item.author}</span>
                <span>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Decision Levers */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono text-stone-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-bold">
            1
          </span>
          CALIBRATE STRATEGIC LEVERS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Model */}
          <div className="rounded-xl border border-amber-950/70 bg-[#160A05] p-4 space-y-3">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase block">
              1. PRICING ARCHITECTURE
            </span>
            {[
              { id: 'FREE' as const, label: 'Free Tier + 5% Transaction Fee', desc: 'Maximizes viral growth with zero barrier' },
              { id: 'LOW' as const, label: 'Affordable Micro-Fee (₹49/mo)', desc: 'Optimal sweet spot for student budgets' },
              { id: 'PREMIUM' as const, label: 'Premium Pass (₹199/mo)', desc: 'High revenue per user, lower conversion' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setPriceModel(opt.id)}
                className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                  priceModel === opt.id
                    ? 'border-amber-400 bg-[#25130A] ring-1 ring-amber-400/40 text-stone-100'
                    : 'border-amber-950/60 bg-[#120703] hover:bg-[#1A0D07] text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-200">{opt.label}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{opt.desc}</div>
              </div>
            ))}
          </div>

          {/* Marketing Channel */}
          <div className="rounded-xl border border-amber-950/70 bg-[#160A05] p-4 space-y-3">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase block">
              2. DISTRIBUTION LEVER
            </span>
            {[
              { id: 'ORGANIC' as const, label: 'Organic Peer Referral Loops', desc: 'Viral invitation bonuses with peer credit' },
              { id: 'CAMPUS_AMBASSADORS' as const, label: 'Campus Ambassador Network', desc: 'Incentivized leads in every hostel' },
              { id: 'PAID_ADS' as const, label: 'Targeted Student Micro-Ads', desc: 'Fast initial traffic, higher burn rate' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setMarketingChannel(opt.id)}
                className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                  marketingChannel === opt.id
                    ? 'border-amber-400 bg-[#25130A] ring-1 ring-amber-400/40 text-stone-100'
                    : 'border-amber-950/60 bg-[#120703] hover:bg-[#1A0D07] text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-200">{opt.label}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{opt.desc}</div>
              </div>
            ))}
          </div>

          {/* Target Customer Segment */}
          <div className="rounded-xl border border-amber-950/70 bg-[#160A05] p-4 space-y-3">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase block">
              3. TARGET CUSTOMER CORE
            </span>
            {[
              { id: 'STUDENTS' as const, label: 'Hostel Undergraduates', desc: 'High churn, ultra-dense word of mouth' },
              { id: 'FACULTY' as const, label: 'Campus Labs & Departments', desc: 'High ticket size, slower approval cycles' },
              { id: 'ENTERPRISES' as const, label: 'Local University Vendors', desc: 'Steady enterprise supply contracts' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setTargetSegment(opt.id)}
                className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                  targetSegment === opt.id
                    ? 'border-amber-400 bg-[#25130A] ring-1 ring-amber-400/40 text-stone-100'
                    : 'border-amber-950/60 bg-[#120703] hover:bg-[#1A0D07] text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-200">{opt.label}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Impact Simulation */}
      <div className="rounded-xl border border-amber-900/40 bg-[#160A05] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-950/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold font-mono text-stone-200 uppercase">
              MARKET SIMULATION IMPACT
            </h4>
          </div>
          <span className="text-xs font-mono text-amber-400">
            {simulated ? 'SIMULATED OUTCOME APPLIED' : 'PENDING SQUAD DECISION'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#1F0F08] border border-amber-950/60">
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 uppercase">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Visitors
            </span>
            <div className="text-base font-bold font-mono text-stone-100 mt-1">
              8,450 → <span className="text-cyan-400">12,600</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+49% Traffic</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1F0F08] border border-amber-950/60">
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 uppercase">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Conversions
            </span>
            <div className="text-base font-bold font-mono text-stone-100 mt-1">
              12% → <span className="text-amber-400 font-black">19%</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+7% Lift</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1F0F08] border border-amber-950/60">
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 uppercase">
              <Smile className="w-3.5 h-3.5 text-emerald-400" />
              CSAT Score
            </span>
            <div className="text-base font-bold font-mono text-stone-100 mt-1">
              61 → <span className="text-emerald-400 font-black">74 / 100</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+13 pts</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1F0F08] border border-amber-950/60">
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 uppercase">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              Monthly Revenue
            </span>
            <div className="text-base font-bold font-mono text-stone-100 mt-1">
              ₹1.2L → <span className="text-amber-300 font-black">₹1.8L</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">+50% MRR</span>
          </div>
        </div>

        {simulated ? (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              PRODUCT-MARKET FIT METRIC THRESHOLD ACHIEVED
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              Your repositioning to <strong className="text-amber-300">{priceModel}</strong> pricing and <strong className="text-amber-300">{marketingChannel}</strong> distribution resolved the core objections. Conversion jumped from 12% to 19% and customer satisfaction reached 74/100. You have unlocked <strong className="text-amber-400">LEVEL 04: GROW</strong>!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-stone-400">
              Apply pricing & positioning choices to simulate real customer behavior.
            </p>
            <button
              type="button"
              onClick={handleSimulate}
              className={`${zoStyles.btnPrimary} text-xs py-2.5 px-6 shrink-0 flex items-center justify-center gap-2`}
            >
              <Sparkles className="w-4 h-4" />
              <span>SUBMIT VALIDATION STRATEGY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
