import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Zap, ArrowRight, Sparkles } from 'lucide-react';

interface ZeroOneCompletionModalProps {
  isOpen: boolean;
  completedLevelNumber: number;
  completedLevelTitle: string;
  rewardXP: number;
  rewardScore: number;
  nextLevelNumber?: number;
  nextLevelTitle?: string;
  onContinue: () => void;
}

export const ZeroOneCompletionModal: React.FC<ZeroOneCompletionModalProps> = ({
  isOpen,
  completedLevelNumber,
  completedLevelTitle,
  rewardXP,
  rewardScore,
  nextLevelNumber,
  nextLevelTitle,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-md bg-[#241006] border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Subtle warm amber glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            MISSION COMPLETE
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-[#FFF7ED]">
            LEVEL 0{completedLevelNumber} • {completedLevelTitle}
          </h2>

          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
            ✓ OBJECTIVES COMPLETE
          </div>
        </div>

        {/* Rewards Box */}
        <div className="relative z-10 grid grid-cols-2 gap-3 bg-[#170A04] p-4 rounded-2xl border border-amber-500/20">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPERIENCE</span>
            </div>
            <div className="text-xl font-display font-black text-amber-400">
              +{rewardXP} XP
            </div>
          </div>

          <div className="space-y-0.5 border-l border-amber-500/15">
            <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-orange-400" />
              <span>SCORE</span>
            </div>
            <div className="text-xl font-display font-black text-orange-400">
              +{rewardScore} SCORE
            </div>
          </div>
        </div>

        {/* Next Mission Unlocked banner */}
        {nextLevelNumber && (
          <div className="relative z-10 p-3.5 rounded-2xl bg-[#2D1409] border border-amber-500/30 text-left flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold">
                NEXT MISSION UNLOCKED
              </div>
              <div className="text-sm font-display font-bold text-[#FFF7ED]">
                LEVEL 0{nextLevelNumber} • {nextLevelTitle}
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
        )}

        <div className="relative z-10 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
