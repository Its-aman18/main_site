import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import {
  Calendar,
  Users,
  MapPin,
  Award,
  Coins,
  ShoppingCart,
  AlertTriangle,
  Presentation,
  Trophy,
  ArrowRight,
  Sparkles,
  Rocket,
  Shield,
  Briefcase,
  TrendingUp,
  Cpu,
  Megaphone,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  Flame,
} from 'lucide-react';
import { ZERO_ONE_CONFIG } from '../data/zeroOneConfig';
import { mockRoles } from '../data/zeroOneMockData';
import { MissionMap } from '../components/MissionMap';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { currentTeam, getBalance, eventStatus, serverTimeRemainingSeconds } = useSimulation();

  return (
    <div className="zo-game-shell min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 transition-colors overflow-x-hidden">
      {/* Background grid texture matching the mission-control design language */}
      <div className="bg-grid-texture relative pb-16 pt-8 sm:pt-14 overflow-hidden">
        {/* Subtle warm amber ambient gradient */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Event Badge with Live Simulation Status */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>CODE.SCRIET FLAGSHIP</span>
                </div>

                <div className="zo-landing-kicker">MISSION CONTROL / SIMULATION 01</div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SIMULATION ACTIVE • {eventStatus}</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                  <span>ZERO </span>
                  <span className="text-orange-500 font-serif font-normal italic">→</span>
                  <span className="font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">
                    {' '}ONE
                  </span>
                </h1>
                <p className="text-2xl sm:text-3xl font-serif italic text-stone-800 dark:text-stone-200 font-medium">
                  Build a startup from zero.
                </p>
              </div>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
                An intense, real-time campus startup simulation where student founder squads build, allocate capital, navigate dynamic market shocks, and pitch live before an executive jury.
              </p>

              {/* Event Metadata Pills */}
              <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>{ZERO_ONE_CONFIG.dates.displayDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>{ZERO_ONE_CONFIG.teamRequirements.minMembers} Members / Squad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{ZERO_ONE_CONFIG.venue.displayLocation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span>{ZERO_ONE_CONFIG.edition}</span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  id="hero-btn-join"
                  onClick={() => onNavigate('onboarding')}
                  className="btn-primary text-base py-3.5 px-8 shadow-xl shadow-orange-500/25 group flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Mission</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-btn-dashboard"
                  onClick={() => onNavigate('team-dashboard')}
                  className="btn-secondary text-base py-3.5 px-7 cursor-pointer"
                >
                  <span>Enter Mission Control</span>
                </button>

                <button
                  id="hero-btn-live"
                  onClick={() => onNavigate('live-screen')}
                  className="px-4 py-3.5 rounded-2xl text-xs font-bold font-mono text-stone-600 dark:text-stone-400 hover:text-orange-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span>Auditorium Screen</span>
                </button>
              </div>

              <MissionMap currentRound="ROUND 1" />
            </div>

            {/* Right Hero Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent p-6 flex items-center justify-center border border-orange-200/60 dark:border-orange-500/20 shadow-2xl">
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6] dark:from-[#11131C] dark:via-[#161822] dark:to-[#0A0B10] border border-orange-200/60 dark:border-stone-800 p-6 flex flex-col items-center justify-between shadow-inner overflow-hidden">
                  {/* Floating Top Badges */}
                  <div className="w-full flex justify-between text-xs font-bold font-serif italic text-amber-900 dark:text-amber-300">
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60">
                      💡 Idea Validation
                    </span>
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60">
                      ⚙️ Build Engine
                    </span>
                  </div>

                  {/* Center Emblem with Rocket Animation */}
                  <div className="relative my-4 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-xl shadow-orange-500/30">
                      <Rocket className="w-16 h-16 text-white transform -rotate-45" />
                    </div>
                    <div className="w-24 h-6 bg-gradient-to-b from-orange-500/60 to-transparent blur-md -mt-2 rounded-full" />
                  </div>

                  {/* Floating Bottom Badges */}
                  <div className="w-full flex justify-between text-xs font-bold font-serif italic text-amber-900 dark:text-amber-300">
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60">
                      ⚡ Scarcity Market
                    </span>
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60">
                      🎙️ Executive Pitch
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Core Feature Cards */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* 1. Capital */}
            <div className="card p-5 text-center flex flex-col items-center justify-center space-y-2 hover:border-orange-400 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                {ZERO_ONE_CONFIG.economics.initialCapitalDisplay}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Virtual Capital
              </div>
            </div>

            {/* 2. Digital Market */}
            <div className="card p-5 text-center flex flex-col items-center justify-center space-y-2 hover:border-orange-400 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Digital Market
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Buy • Sell • Auction
              </div>
            </div>

            {/* 3. Real-time Crisis */}
            <div className="card p-5 text-center flex flex-col items-center justify-center space-y-2 hover:border-orange-400 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Real-time Crisis
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Adapt & Survive
              </div>
            </div>

            {/* 4. Investor Session */}
            <div className="card p-5 text-center flex flex-col items-center justify-center space-y-2 hover:border-orange-400 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Presentation className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Investor Session
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Pitch to Jury
              </div>
            </div>

            {/* 5. Rewards */}
            <div className="card p-5 text-center flex flex-col items-center justify-center space-y-2 hover:border-orange-400 transition-all group col-span-2 sm:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Exciting Rewards
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Prizes & Recognition
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Squad Roles Breakdown Section */}
      <section id="squad-roles" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EFE8DD] dark:border-[#1E2230]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge badge-orange mb-2">Squad Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-stone-900 dark:text-stone-100">
            4 Specialized Founder Roles
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            Success requires seamless collaboration. Every member commands a distinct functional domain with unique cryptographic privileges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CEO */}
          <div className="card p-6 space-y-4 hover:border-orange-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-orange-600">ROLE 01 • STRATEGY</div>
              <h3 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">CEO</h3>
              <p className="text-xs font-medium text-stone-500">Chief Executive Officer</p>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Drives strategic product vision, resolves team crises, and holds mandatory Two-Key approval authority for purchases above {ZERO_ONE_CONFIG.economics.twoKeyThresholdDisplay}.
            </p>
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
              Key Power: <span className="text-orange-500 font-bold">Two-Key Co-Signer</span>
            </div>
          </div>

          {/* CFO */}
          <div className="card p-6 space-y-4 hover:border-orange-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-600">ROLE 02 • FINANCE</div>
              <h3 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">CFO</h3>
              <p className="text-xs font-medium text-stone-500">Chief Financial Officer</p>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Controls the ₹10L virtual bankroll, executes digital market bids, monitors runway metrics, and initiates expenditure proposals.
            </p>
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
              Key Power: <span className="text-emerald-500 font-bold">Ledger & Procurement</span>
            </div>
          </div>

          {/* CTO */}
          <div className="card p-6 space-y-4 hover:border-orange-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-blue-600">ROLE 03 • TECHNOLOGY</div>
              <h3 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">CTO</h3>
              <p className="text-xs font-medium text-stone-500">Chief Technology Officer</p>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Architects cloud infrastructure, unlocks technical product upgrades, and manages server stability under simulated surge loads.
            </p>
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
              Key Power: <span className="text-blue-500 font-bold">Infra & Build Station</span>
            </div>
          </div>

          {/* CMO */}
          <div className="card p-6 space-y-4 hover:border-orange-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-purple-600">ROLE 04 • GROWTH</div>
              <h3 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">CMO</h3>
              <p className="text-xs font-medium text-stone-500">Chief Marketing Officer</p>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Designs user acquisition campaigns, fills Startup Canvas marketing channels, and delivers the 3-minute executive pitch deck.
            </p>
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
              Key Power: <span className="text-purple-500 font-bold">Canvas & Pitch Lead</span>
            </div>
          </div>
        </div>
      </section>

      {/* Event Journey Section */}
      <section id="event-journey" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EFE8DD] dark:border-[#1E2230]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge badge-orange mb-2">Interactive Simulation Flow</span>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-stone-900 dark:text-stone-100">
            The ZERO → ONE Journey
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            Participants do not simply listen to a seminar. Every squad confronts consecutive, consequential business challenges in real time.
          </p>
        </div>

        {/* 8-step Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Team Formation', desc: 'Form 4-member founder squads: CEO, CFO, CTO, CMO with device binding.' },
            { step: '02', title: 'Problem & Customer', desc: 'Identify validated college/industry pain points and define the target customer.' },
            { step: '03', title: '₹10L Seed Capital', desc: 'Receive authoritative append-only virtual bankroll with runway telemetry.' },
            { step: '04', title: 'Build & Market', desc: 'Purchase tech infrastructure, hire talent, and deploy customer campaigns.' },
            { step: '05', title: 'Face the Crisis', desc: 'High-attention full screen crisis takeover with 6-minute decision clock.' },
            { step: '06', title: 'Auction & Trading', desc: 'Sealed-bid auction for exclusive distribution rights and peer asset trading.' },
            { step: '07', title: 'Build Station', desc: 'CTO provisions working interactive prototype with live code demo.' },
            { step: '08', title: 'Pitch & Reveal', desc: '3-minute shark-tank style defense before executive investor jury and audience.' },
          ].map((item, idx) => (
            <div key={idx} className="card p-5 relative overflow-hidden group hover:border-orange-500 transition-all">
              <span className="text-4xl font-mono font-black text-stone-100 dark:text-stone-800 absolute right-4 top-3 group-hover:text-orange-500/10 transition-colors">
                {item.step}
              </span>
              <div className="relative z-10 space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs mb-3">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Launch Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-2xl font-black font-heading">
              Ready to take your startup from ZERO to ONE?
            </h3>
            <p className="text-sm text-orange-100">
              Active simulation session is running in {eventStatus} • {ZERO_ONE_CONFIG.venue.campus}.
            </p>
          </div>
          <button
            id="banner-btn-launch"
            onClick={() => onNavigate('team-dashboard')}
            className="btn-secondary bg-white text-orange-600 hover:bg-orange-50 border-none font-bold text-base py-3 px-8 shadow-xl flex-shrink-0 cursor-pointer"
          >
            Launch Founder Hub →
          </button>
        </div>
      </section>
    </div>
  );
};
