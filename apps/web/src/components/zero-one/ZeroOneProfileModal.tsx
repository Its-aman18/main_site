import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import type { PlayerBadge } from './types';

interface ZeroOneProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  email: string;
  teamName: string;
  teamCode: string;
  currentLevel: number;
  totalXP: number;
  rank: string;
  badges?: PlayerBadge[];
}

export const ZeroOneProfileModal: React.FC<ZeroOneProfileModalProps> = ({
  isOpen,
  onClose,
  playerName,
  email,
  teamName,
  teamCode,
  currentLevel,
  totalXP,
  rank,
  badges = [
    { id: 'b1', title: 'FIRST MISSION', description: 'Initiated Level 01 Problem Discovery', icon: '🚀', unlocked: true },
    { id: 'b2', title: 'TEAM BUILDER', description: 'Assembled a multi-disciplinary founder squad', icon: '🛡️', unlocked: true },
    { id: 'b3', title: 'INNOVATOR', description: 'Constructed working MVP prototype in Level 02', icon: '⚡', unlocked: true },
    { id: 'b4', title: 'VALIDATOR', description: 'Surpassed customer validation threshold', icon: '🎯', unlocked: false },
    { id: 'b5', title: 'ZERO → ONE', description: 'Successfully scaled and defended startup on stage', icon: '🏆', unlocked: false },
  ],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#220F06] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
          <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
            FOUNDER DOSSIER
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#180B04] border border-amber-500/20 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-black text-xl shadow-lg shadow-amber-500/30">
            {playerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-[#FFF7ED]">
              {playerName}
            </h2>
            <div className="text-xs text-[#FED7AA]/60 font-mono">
              {email}
            </div>
            <div className="text-xs text-amber-300 font-semibold mt-0.5">
              {teamName} ({teamCode ? `#${teamCode}` : '#TT-001'})
            </div>
          </div>
        </div>

        {/* 3 Metric Tiles */}
        <div className="grid grid-cols-3 gap-2 bg-[#170A04] p-3 rounded-2xl border border-amber-500/15 text-center">
          <div>
            <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">Level</div>
            <div className="text-lg font-display font-black text-[#FFF7ED]">0{currentLevel}</div>
          </div>
          <div className="border-x border-amber-500/15">
            <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">Points</div>
            <div className="text-lg font-display font-black text-amber-400">{totalXP.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">Rank</div>
            <div className="text-lg font-display font-black text-orange-400">{rank}</div>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-between">
            <span>ACHIEVEMENT BADGES</span>
            <span className="text-[10px] text-[#FED7AA]/60">
              {badges.filter((b) => b.unlocked).length} / {badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  b.unlocked
                    ? 'bg-[#291408] border-amber-500/30 text-[#FFF7ED]'
                    : 'bg-[#180B04] border-stone-800 text-stone-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{b.icon}</span>
                  <div>
                    <div className="text-xs font-bold font-mono">
                      {b.title}
                    </div>
                    <div className="text-[11px] text-[#FED7AA]/60">
                      {b.description}
                    </div>
                  </div>
                </div>

                <div>
                  {b.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-stone-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#291408] hover:bg-[#341A0B] text-amber-300 border border-amber-500/30"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
};
