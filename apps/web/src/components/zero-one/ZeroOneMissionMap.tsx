import React from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Wrench,
  Users,
  TrendingUp,
  Rocket,
  Trophy,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ZERO_ONE_LEVELS, type MissionNodeStatus, type ZeroOneLevelConfig } from './types';

interface ZeroOneMissionMapProps {
  currentLevel: number;
  onSelectLevel: (levelNumber: number) => void;
  levelsState?: Record<number, MissionNodeStatus>;
  onLevelDeniedNotice?: (reason: string) => void;
}

export const ZeroOneMissionMap: React.FC<ZeroOneMissionMapProps> = ({
  currentLevel,
  onSelectLevel,
  levelsState,
  onLevelDeniedNotice,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-300" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-orange-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-amber-300" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-orange-300" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-yellow-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-300" />;
    }
  };

  const getComputedStatus = (lvl: ZeroOneLevelConfig): MissionNodeStatus => {
    if (levelsState && levelsState[lvl.levelNumber]) {
      return levelsState[lvl.levelNumber];
    }
    if (lvl.levelNumber < currentLevel) return 'COMPLETED';
    if (lvl.levelNumber === currentLevel) return 'ACTIVE';
    return 'LOCKED';
  };

  const handleNodeClick = (lvl: ZeroOneLevelConfig, status: MissionNodeStatus) => {
    if (status === 'LOCKED') {
      if (onLevelDeniedNotice) {
        onLevelDeniedNotice(`MISSION ACCESS DENIED — Level 0${lvl.levelNumber} (${lvl.title}) is locked by Mission Control until previous objectives are achieved.`);
      }
      return;
    }
    onSelectLevel(lvl.levelNumber);
  };

  return (
    <div className="w-full bg-[#170B05] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header matching Reference Image Panel 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>INTERACTIVE LEVEL STRUCTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-[#FFF7ED]">
              MISSION MAP
            </h2>
            <p className="text-sm text-[#FED7AA]/80 mt-1">
              Complete each level to go from ZERO to ONE.
            </p>
          </div>

          <div className="hidden sm:block bg-[#241006] px-4 py-2.5 rounded-xl border border-amber-500/20 max-w-xs text-right">
            <div className="text-xs font-bold text-amber-300 font-display">From Ideas to Impact</div>
            <div className="text-[11px] text-[#FED7AA]/60">A journey of innovation, teamwork and execution.</div>
          </div>
        </div>

        {/* Desktop Horizontal Map Layout matching Reference Image */}
        <div className="hidden lg:block relative pt-4 pb-8 overflow-x-auto no-scrollbar">
          {/* Connecting glowing rail line */}
          <div className="absolute top-[48px] left-[70px] right-[70px] h-[3px] bg-gradient-to-r from-amber-600/30 via-amber-500/50 to-amber-900/20 z-0" />

          <div className="flex items-start justify-between min-w-[950px] relative z-10 px-2">
            {/* START Node */}
            <div className="flex flex-col items-center pt-5 mr-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-mono font-black text-stone-950 shadow-md shadow-amber-500/30 ring-4 ring-[#170B05]">
                START
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 mt-2 tracking-wider">
                ORIGIN
              </span>
            </div>

            {/* Level Cards */}
            {ZERO_ONE_LEVELS.map((lvl) => {
              const status = getComputedStatus(lvl);
              const isCurrent = status === 'ACTIVE';
              const isDone = status === 'COMPLETED';
              const isLocked = status === 'LOCKED';

              return (
                <motion.div
                  key={lvl.levelNumber}
                  whileHover={!isLocked ? { scale: 1.03, y: -4 } : {}}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNodeClick(lvl, status)}
                  className={`flex flex-col items-center flex-1 max-w-[170px] cursor-pointer group ${
                    isLocked ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                >
                  {/* Circular Node Icon on the rail */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ring-4 ring-[#170B05] ${
                      isDone
                        ? 'bg-[#1D321F] border border-emerald-500/60 shadow-lg shadow-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 border border-amber-300 shadow-xl shadow-amber-500/40 text-stone-950 scale-110 animate-bounce-subtle'
                        : 'bg-[#220F06] border border-amber-500/20 text-stone-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-stone-500" />
                    ) : (
                      getIcon(lvl.iconName)
                    )}
                  </div>

                  {/* Level Box Card */}
                  <div
                    className={`w-full p-3.5 rounded-2xl border text-center transition-all duration-200 ${
                      isCurrent
                        ? 'bg-[#2D1409] border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40'
                        : isDone
                        ? 'bg-[#211107] border-emerald-500/30'
                        : 'bg-[#1C0D05]/80 border-amber-500/15 group-hover:border-amber-500/30'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 mb-0.5">
                      {lvl.levelNumber === 6 ? 'FINAL' : `LEVEL 0${lvl.levelNumber}`}
                    </div>
                    <div className="text-sm font-display font-black text-[#FFF7ED] truncate">
                      {lvl.title}
                    </div>
                    <div className="text-[11px] text-[#FED7AA]/70 line-clamp-2 h-8 mt-1 leading-tight">
                      {lvl.subtitle}
                    </div>

                    {/* Status Pill Badge matching Panel 2 */}
                    <div className="mt-3">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ✓ COMPLETED
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-sans shadow-sm shadow-amber-500/30">
                          ● IN PROGRESS
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-900/60 text-stone-400 border border-stone-800">
                          <Lock className="w-2.5 h-2.5" /> LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Timeline Layout */}
        <div className="block lg:hidden relative pl-6 space-y-4">
          {/* Vertical progress line */}
          <div className="absolute top-4 bottom-4 left-3 w-[2px] bg-gradient-to-b from-amber-500 via-orange-500 to-amber-950/20 z-0" />

          {ZERO_ONE_LEVELS.map((lvl) => {
            const status = getComputedStatus(lvl);
            const isCurrent = status === 'ACTIVE';
            const isDone = status === 'COMPLETED';
            const isLocked = status === 'LOCKED';

            return (
              <div
                key={lvl.levelNumber}
                onClick={() => handleNodeClick(lvl, status)}
                className={`relative z-10 flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-[#2E1409] border-amber-500 shadow-lg shadow-amber-500/20'
                    : isDone
                    ? 'bg-[#221006] border-emerald-500/30'
                    : 'bg-[#1C0D05]/80 border-amber-500/15'
                }`}
              >
                {/* Node indicator */}
                <div
                  className={`-ml-7 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-[#170B05] ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-[#220F06] text-stone-500 border border-amber-500/30'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span>0{lvl.levelNumber}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {lvl.levelNumber === 6 ? 'FINAL MISSION' : `LEVEL 0${lvl.levelNumber}`}
                    </span>
                    {isDone && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        COMPLETED
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-stone-950 bg-amber-400 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-medium text-stone-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-display font-bold text-[#FFF7ED]">
                    {lvl.title}
                  </h4>
                  <p className="text-xs text-[#FED7AA]/70 mt-0.5">
                    {lvl.subtitle}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-amber-500/10 text-[11px] font-mono text-amber-300/80">
                    <span>+{lvl.rewardXP} XP</span>
                    <span>•</span>
                    <span>~{lvl.estimatedMinutes}m duration</span>
                  </div>
                </div>

                {!isLocked && (
                  <ArrowRight className="w-5 h-5 text-amber-400 shrink-0 self-center" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
