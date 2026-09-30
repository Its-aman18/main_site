import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, Star, Rocket, CheckCircle } from 'lucide-react';

interface ResultsRevealPageProps {
  onNavigate: (view: string) => void;
}

export const ResultsRevealPage: React.FC<ResultsRevealPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    // Fire festive victory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F97316', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'],
      });
    } catch {
      // ignore
    }
  }, []);

  const awards = [
    { category: 'Startup of the Event', team: 'InnovateX', code: 'Team 07', reason: 'Highest composite score, disciplined capital allocation & resilient crisis mitigation.' },
    { category: 'Most Innovative Idea', team: 'TechNova', code: 'Team 01', reason: 'Pioneered AI-assisted peer automated code evaluation system.' },
    { category: 'Best Business Model', team: 'AgriNext', code: 'Team 02', reason: 'Highest profit margins and validated B2B sugarcane drone subscriptions.' },
    { category: 'Best Pitch & Defense', team: 'Visionary', code: 'Team 04', reason: 'Compelling 2-minute shark defense and precise unit economics response.' },
    { category: 'Best Crisis Response', team: 'CodeCatalyst', code: 'Team 03', reason: 'Zero downtime during server crisis and immediate competitor counter-blitz.' },
    { category: "CEO's Choice Award", team: 'NexGen', code: 'Team 05', reason: 'Exceptional grit and capital preservation under extreme market pressure.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>OFFICIAL CEREMONY & WINNERS REVEAL</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
            ZERO → ONE Grand Awards
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            Recognizing visionary campus founders who demonstrated world-class decision making, financial agility, and startup grit.
          </p>
        </div>

        {/* 1st Place Podium Hero Card */}
        <div className="card p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border-2 border-amber-400/60 shadow-2xl rounded-3xl relative overflow-hidden text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="badge badge-amber text-xs font-mono font-bold">
              1ST PLACE CHAMPIONS • STARTUP OF THE EVENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-stone-900 dark:text-stone-100">
              Team InnovateX (Team 07)
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
              Winner of the Flagship ₹10,00,000 Simulation. Final Capital: ₹9,20,000 • Health: 82% • Composite Score: 420 pts.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('live-screen')}
              className="btn-primary py-2.5 px-6 text-xs font-bold"
            >
              Auditorium Screen
            </button>
            <button
              onClick={() => onNavigate('team-dashboard')}
              className="btn-secondary py-2.5 px-6 text-xs font-bold"
            >
              Back to Team Hub
            </button>
          </div>
        </div>

        {/* Official Category Awards Grid (Rule 79) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {awards.map((award, idx) => (
            <div key={idx} className="card p-5 space-y-2 border hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  {award.category}
                </span>
                <span className="text-xs font-mono font-bold text-stone-400">
                  {award.code}
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100">
                {award.team}
              </h3>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {award.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
