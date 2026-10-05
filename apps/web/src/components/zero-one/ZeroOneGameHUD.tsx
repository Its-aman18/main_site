import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Trophy,
  Users,
  ShieldAlert,
  HelpCircle,
  Zap,
  Activity,
  ArrowLeft,
  LogOut,
  Coins,
  Clock,
} from 'lucide-react';
import type { ZeroOneView } from './types';

interface ZeroOneGameHUDProps {
  currentView: ZeroOneView;
  onNavigate: (view: ZeroOneView) => void;
  teamName: string;
  currentLevel: number;
  capital?: number;
  xp: number;
  rank: string;
  statusText?: string;
  remainingSeconds?: number;
  isAdmin: boolean;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
  user: { name?: string; email?: string; avatar?: string | null } | null;
  onLogout?: () => void;
}

export const ZeroOneGameHUD: React.FC<ZeroOneGameHUDProps> = ({
  currentView,
  onNavigate,
  teamName,
  currentLevel,
  capital = 750000,
  xp,
  rank,
  statusText = 'MISSION ACTIVE',
  remainingSeconds = 18 * 60 + 42,
  isAdmin,
  onOpenHowToPlay,
  onOpenProfile,
  user,
  onLogout,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatCapital = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#160B05]/95 backdrop-blur-md px-3 sm:px-6 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
        {/* Brand & Game identity */}
        <div className="flex items-center gap-3">
          <Link
            to="/events"
            className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors text-xs font-medium mr-1 hidden lg:flex"
            title="Back to all events"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Events</span>
          </Link>

          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-amber-500/40 shadow-sm group-hover:border-amber-400 transition-colors">
              <img src="/logo.jpeg" alt="code.scriet" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-sm tracking-wider text-[#FFF7ED]">
                  ZERO <span className="text-amber-400">→</span> ONE
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  GAME
                </span>
              </div>
              <span className="text-[10px] text-amber-200/50 hidden md:block">
                Startup Simulation
              </span>
            </div>
          </button>
        </div>

        {/* Strategy Game Telemetry HUD Bar (Desktop 6-field spec) */}
        <div className="hidden md:flex items-center gap-3 bg-[#231006] px-3.5 py-1.5 rounded-full border border-amber-500/25 shadow-inner">
          {/* LEVEL */}
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-stone-400 text-[10px] uppercase font-mono">LEVEL:</span>
            <span className="font-mono font-bold text-amber-300 text-xs">
              0{currentLevel}
            </span>
          </div>

          <div className="h-3 w-px bg-amber-500/20" />

          {/* TEAM */}
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-400 text-[10px] uppercase font-mono">TEAM:</span>
            <span className="font-bold text-[#FFF7ED] text-xs max-w-[110px] truncate">
              {teamName || 'SOLO FOUNDER'}
            </span>
          </div>

          <div className="h-3 w-px bg-amber-500/20" />

          {/* CAPITAL */}
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-stone-400 text-[10px] uppercase font-mono">CAPITAL:</span>
            <span className="font-mono font-bold text-amber-300 text-xs">
              {formatCapital(capital)}
            </span>
          </div>

          <div className="h-3 w-px bg-amber-500/20" />

          {/* SCORE */}
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-400 text-[10px] uppercase font-mono">SCORE:</span>
            <span className="font-mono font-bold text-[#FFF7ED] text-xs">
              {xp.toLocaleString()} XP
            </span>
          </div>

          <div className="h-3 w-px bg-amber-500/20" />

          {/* TIME */}
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400 text-[10px] uppercase font-mono">TIME:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">
              {formatTimer(secondsLeft)}
            </span>
          </div>

          <div className="h-3 w-px bg-amber-500/20" />

          {/* RANK */}
          <div className="flex items-center gap-1.5 text-xs">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-stone-400 text-[10px] uppercase font-mono">RANK:</span>
            <span className="font-mono font-bold text-amber-400 text-xs">
              {rank}
            </span>
          </div>

          <div className="h-3 w-px bg-amber-500/20 hidden xl:block" />

          {/* STATUS */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              {statusText}
            </span>
          </div>
        </div>

        {/* Mobile Compact Telemetry Indicator */}
        <div className="flex md:hidden items-center gap-2 bg-[#200E06] px-2.5 py-1 rounded-full border border-amber-500/25">
          <span className="text-[10px] font-mono text-amber-400 font-bold">L0{currentLevel}</span>
          <span className="text-stone-600">•</span>
          <span className="text-[10px] font-mono text-stone-200">{xp} XP</span>
          <span className="text-stone-600">•</span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">{formatTimer(secondsLeft)}</span>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2">
          {/* Rules trigger */}
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
            title="Mission Rules"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-mono text-xs">Rules</span>
          </button>

          {/* Mission Map shortcut */}
          <button
            onClick={() => onNavigate('map')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              currentView === 'map'
                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                : 'text-amber-200/90 border-amber-500/25 hover:border-amber-500/50 hover:bg-[#2C1409]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline font-mono text-xs">Map</span>
          </button>

          {/* Admin Mission Control */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('mission-control')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                currentView === 'mission-control'
                  ? 'bg-orange-600 text-white font-bold border-orange-400 shadow-md animate-pulse'
                  : 'text-orange-400 border-orange-500/40 hover:bg-orange-500/15'
              }`}
              title="Admin Mission Control"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-xs font-bold">Admin</span>
            </button>
          )}

          {/* Player avatar button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 rounded-full border border-amber-500/30 hover:border-amber-400 bg-[#2A1308] transition-all"
            title="Player Mission Dossier"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'Founder'}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-stone-950">
                {(user?.name || teamName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-stone-400 hover:text-rose-400 p-1.5 rounded-lg border border-amber-500/20 hover:bg-rose-500/10 transition-colors"
              title="Log out of game session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
