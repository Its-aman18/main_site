import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Search, Calendar, Users, MapPin, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { CodeScrietLogo } from '../components/CodeScrietLogo';

interface EventsDirectoryPageProps {
  onNavigate: (view: string) => void;
}

export const EventsDirectoryPage: React.FC<EventsDirectoryPageProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'PAST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Heading Section matching Screenshot 2 */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CODE.SCRIET EVENTS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 dark:text-stone-100 font-medium">
            Where curiosity meets{' '}
            <span className="font-serif italic text-orange-600 dark:text-orange-500 font-normal">
              code.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
            Workshops, hackathons, talks, and labs — built by the club, open to everyone. Browse what's coming up and reserve your spot.
          </p>
        </div>

        {/* Filter Pills matching Screenshot 2 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            All <span className="ml-1 opacity-75 font-mono">9</span>
          </button>

          <button
            onClick={() => setActiveFilter('UPCOMING')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'UPCOMING'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            Upcoming <span className="ml-1 opacity-75 font-mono">1</span>
          </button>

          <button
            onClick={() => setActiveFilter('LIVE')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'LIVE'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            Live <span className="ml-1 opacity-75 font-mono">0</span>
          </button>

          <button
            onClick={() => setActiveFilter('PAST')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'PAST'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            Past <span className="ml-1 opacity-75 font-mono">8</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, tags, venues..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-white dark:bg-[#12141C] border border-stone-200 dark:border-stone-800"
          />
        </div>

        {/* Featured ZERO -> ONE Event Card matching Screenshot 2 */}
        <div className="space-y-4">
          <div
            onClick={() => onNavigate('landing')}
            className="card card-interactive max-w-2xl overflow-hidden border-2 border-orange-500/30 hover:border-orange-500 shadow-xl transition-all group"
          >
            {/* Visual Hero Banner with Date Box */}
            <div className="relative h-60 bg-gradient-to-br from-[#2b170c] via-[#451e08] to-[#120a06] p-6 flex flex-col justify-between overflow-hidden">
              {/* Warm glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/30 via-transparent to-transparent" />

              {/* Date Box and Status Pill */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="w-14 h-16 rounded-2xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center shadow-lg font-heading">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                    FEB
                  </span>
                  <span className="text-2xl font-black">28</span>
                </div>

                <span className="badge badge-amber font-bold text-[10px] px-3 py-1 shadow-sm">
                  UPCOMING
                </span>
              </div>

              {/* Banner Graphic Center */}
              <div className="relative z-10 space-y-1 text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black font-heading tracking-wide text-white flex items-center gap-2">
                  <span>ZERO → ONE</span>
                </div>
                <div className="text-xs text-orange-200 font-medium">
                  Startup Simulation Event • From ideas to startups.
                </div>
              </div>

              {/* Tags inside banner */}
              <div className="relative z-10 flex flex-wrap gap-2 text-[11px] font-semibold text-stone-200">
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                  <Users className="w-3 h-3 text-orange-400" />
                  Teams 3–5
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  Virtual Capital 10 Lakh
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  SCRIET Campus
                </span>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100 group-hover:text-orange-600 transition-colors">
                ZERO → ONE
              </h3>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                An interactive startup simulation to experience building, managing and pitching a startup. Receive ₹10,00,000 virtual capital, navigate real-time crises, trade with peers, and pitch to angel judges.
              </p>

              {/* Footer row */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2 font-medium">
                  <CodeScrietLogo size={22} showText={true} />
                  <span>•</span>
                  <span>28/02/2026</span>
                </div>

                <div className="flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
