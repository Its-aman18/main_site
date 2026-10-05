import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Compass,
  Crosshair,
  Users,
  Trophy,
  User,
  LogOut,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Plus,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import type { ZeroOneView } from './types';
import { ZERO_ONE_LEVELS } from './types';

interface TeamMemberDisplay {
  id: string;
  name: string;
  role: 'Leader' | 'Member';
  avatar?: string | null;
  status: 'Active' | 'Idle' | 'Offline';
}

interface ZeroOneDashboardProps {
  currentView: ZeroOneView;
  onNavigate: (view: ZeroOneView) => void;
  teamName: string;
  teamCode: string;
  currentLevel: number;
  xp: number;
  rank: string;
  levelsCompleted: number;
  totalLevels?: number;
  teamMembers: TeamMemberDisplay[];
  inviteCode: string;
  remainingSeconds: number;
  onContinueMission: () => void;
  onOpenTeam: () => void;
  onExitGame: () => void;
}

export const ZeroOneDashboard: React.FC<ZeroOneDashboardProps> = ({
  currentView,
  onNavigate,
  teamName,
  teamCode,
  currentLevel,
  xp,
  rank,
  levelsCompleted,
  totalLevels = 5,
  teamMembers,
  inviteCode,
  remainingSeconds,
  onContinueMission,
  onOpenTeam,
  onExitGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(remainingSeconds > 0 ? remainingSeconds : 2 * 3600 + 14 * 60 + 36);

  useEffect(() => {
    if (remainingSeconds > 0) {
      setTimeLeft(remainingSeconds);
    }
  }, [remainingSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const currentLevelConfig = ZERO_ONE_LEVELS.find((l) => l.levelNumber === currentLevel) || ZERO_ONE_LEVELS[1];

  const handleCopyInvite = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Mission Map', icon: Compass },
    { id: 'level', label: 'My Mission', icon: Crosshair },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'register', label: 'Mission Profile', icon: User },
  ] as const;

  return (
    <div className="w-full bg-[#140904] text-[#FFF7ED] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Side Game Navigation (Desktop matching Panel 3) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-[#1F0E06]/95 border border-amber-500/20 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400/80 mb-3 px-3">
              GAME NAVIGATION
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as ZeroOneView)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/25'
                        : 'text-[#FED7AA]/80 hover:text-white hover:bg-[#2C1409]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-amber-500/15">
              <button
                onClick={onExitGame}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Return to Code.SCRIET</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Surface (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Welcome Team Hero Card matching Panel 3 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#291308] to-[#1C0D05] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: Team Identity & Mission Progress */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80">
                      WELCOME BACK
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl sm:text-3xl font-display font-black text-[#FFF7ED]">
                        {teamName || 'TECH TITANS'}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {teamCode ? `TEAM #${teamCode}` : 'TEAM #TT-001'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-mono uppercase text-amber-400/90 tracking-wider mb-1">
                    CURRENT MISSION
                  </div>
                  <div className="text-lg sm:text-xl font-display font-extrabold text-[#FFF7ED] flex items-center gap-2">
                    <span>LEVEL 0{currentLevel} • {currentLevelConfig.title}</span>
                  </div>
                </div>

                {/* Progress bar (e.g. 72%) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#FED7AA]/70">MISSION OBJECTIVES</span>
                    <span className="text-amber-400 font-bold">72%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#140904] border border-amber-500/20 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-700"
                      style={{ width: '72%' }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onContinueMission}
                    className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Continue Mission</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Cute Robot Assistant + Dialogue box matching Panel 3 */}
              <div className="md:col-span-5 flex flex-col items-center sm:items-end space-y-3">
                <div className="w-full bg-[#1F0E06]/90 border border-amber-500/30 rounded-2xl p-3.5 shadow-lg backdrop-blur-md">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>MISSION CONTROL</span>
                  </div>
                  <p className="text-xs text-[#FED7AA]/90 leading-relaxed font-sans">
                    Keep going! Complete your current objectives in Level 0{currentLevel} to submit prototype evidence and unlock the next level.
                  </p>
                </div>

                <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl bg-[#140904]">
                  <img
                    src="/zero-one/hero-robot.jpg"
                    alt="Robot Copilot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140904]/70 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stat Tiles matching Panel 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#220F06] border border-amber-500/20 rounded-2xl p-4 shadow-md">
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {xp.toLocaleString()}
              </div>
              <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono mt-0.5">
                Total Points
              </div>
            </div>

            <div className="bg-[#220F06] border border-amber-500/20 rounded-2xl p-4 shadow-md">
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {rank}
              </div>
              <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono mt-0.5">
                Team Rank
              </div>
            </div>

            <div className="bg-[#220F06] border border-amber-500/20 rounded-2xl p-4 shadow-md">
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {levelsCompleted}/{totalLevels}
              </div>
              <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono mt-0.5">
                Levels Completed
              </div>
            </div>

            <div className="bg-[#220F06] border border-amber-500/20 rounded-2xl p-4 shadow-md">
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {teamMembers.length}
              </div>
              <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono mt-0.5">
                Team Members
              </div>
            </div>
          </div>

          {/* Bottom Row: Your Team Roster + Upcoming Deadline Countdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Your Team Roster (7 cols) */}
            <div className="md:col-span-7 bg-[#220F06] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                    YOUR TEAM
                  </div>
                  <button
                    onClick={onOpenTeam}
                    className="text-xs text-amber-300 hover:text-white transition-colors"
                  >
                    View All →
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {teamMembers.map((m) => (
                    <div key={m.id} className="flex flex-col items-center">
                      <div className="relative">
                        {m.avatar ? (
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-stone-950 text-sm border-2 border-amber-500/40">
                            {m.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#220F06]" />
                      </div>
                      <span className="text-xs text-[#FFF7ED] font-medium mt-1 truncate max-w-[65px] text-center">
                        {m.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        {m.role}
                      </span>
                    </div>
                  ))}

                  {/* Add / Invite Button */}
                  <button
                    onClick={handleCopyInvite}
                    className="flex flex-col items-center group cursor-pointer"
                    title="Click to copy team invite code"
                  >
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-amber-500/40 hover:border-amber-400 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-all bg-[#170A04]">
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                    </div>
                    <span className="text-xs text-amber-300 mt-1 font-medium">
                      {copied ? 'Copied!' : 'Invite'}
                    </span>
                    <span className="text-[10px] text-[#FED7AA]/50 font-mono">
                      {inviteCode || 'CODE'}
                    </span>
                  </button>
                </div>
              </div>

              {inviteCode && (
                <div className="mt-4 pt-3 border-t border-amber-500/10 flex items-center justify-between text-xs">
                  <span className="text-[#FED7AA]/60">Invite Code: <strong className="text-amber-300 font-mono">{inviteCode}</strong></span>
                  <button
                    onClick={handleCopyInvite}
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Deadline Countdown (5 cols) matching Panel 3 */}
            <div className="md:col-span-5 bg-[#220F06] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>UPCOMING DEADLINE</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2">
                  <div className="bg-[#170A04] p-2.5 rounded-xl border border-amber-500/15">
                    <div className="text-2xl sm:text-3xl font-mono font-black text-[#FFF7ED]">
                      {String(hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60 mt-1">
                      Hours
                    </div>
                  </div>

                  <div className="bg-[#170A04] p-2.5 rounded-xl border border-amber-500/15">
                    <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                      {String(minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60 mt-1">
                      Minutes
                    </div>
                  </div>

                  <div className="bg-[#170A04] p-2.5 rounded-xl border border-amber-500/15">
                    <div className="text-2xl sm:text-3xl font-mono font-black text-orange-400">
                      {String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60 mt-1">
                      Seconds
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-[#FED7AA]/70 text-center font-mono">
                {timeLeft < 600 ? (
                  <span className="text-rose-400 font-bold animate-pulse">
                    ⚠️ CRITICAL TIME: Finish mission objectives immediately!
                  </span>
                ) : (
                  <span>Mission timer synchronized with Mission Control server.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
