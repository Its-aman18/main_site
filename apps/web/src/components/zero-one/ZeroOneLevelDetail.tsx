import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Trophy,
  Clock,
  FileText,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ZERO_ONE_LEVELS, type MissionObjective } from './types';
import { zoStyles } from './zeroOneTheme';

interface ZeroOneLevelDetailProps {
  levelNumber: number;
  onBackToMap: () => void;
  onOpenSubmitModal: () => void;
  isCompleted?: boolean;
  isLocked?: boolean;
  remainingSeconds?: number;
  hasSubmitted?: boolean;
}

export const ZeroOneLevelDetail: React.FC<ZeroOneLevelDetailProps> = ({
  levelNumber,
  onBackToMap,
  onOpenSubmitModal,
  isCompleted = false,
  isLocked = false,
  remainingSeconds = 2 * 3600 + 14 * 60 + 36,
  hasSubmitted = false,
}) => {
  const levelConfig = ZERO_ONE_LEVELS.find((l) => l.levelNumber === levelNumber) || ZERO_ONE_LEVELS[1];
  const [objectives, setObjectives] = useState<MissionObjective[]>(levelConfig.objectives);
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    setObjectives(levelConfig.objectives);
  }, [levelConfig]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleObjective = (id: string) => {
    if (isCompleted || isLocked) return;
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, completed: !obj.completed } : obj))
    );
  };

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="w-full bg-[#140904] text-[#FFF7ED] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb matching Reference Image Panel 4 */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#FED7AA]/70">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mission Map</span>
          </button>
          <span>&gt;</span>
          <span className="text-amber-400 font-bold">
            Level 0{levelNumber}
          </span>
        </div>

        {/* Level Title & Status Row matching Panel 4 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono uppercase tracking-widest text-amber-400 font-bold">
                {levelNumber === 6 ? 'FINAL MISSION' : `LEVEL 0${levelNumber}`}
              </span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                </span>
              ) : isLocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-stone-900 text-stone-400 border border-stone-800">
                  <Lock className="w-3.5 h-3.5" /> LOCKED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-sm shadow-amber-500/30">
                  IN PROGRESS
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#FFF7ED]">
              {levelConfig.title}
            </h1>
            <p className="text-sm sm:text-base text-[#FED7AA]/80 max-w-2xl leading-relaxed">
              {levelConfig.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToMap}
              className={zoStyles.btnSecondary}
            >
              Mission Map
            </button>
            {!isLocked && (
              <button
                onClick={onOpenSubmitModal}
                className={zoStyles.btnPrimary}
              >
                <span>{hasSubmitted ? 'Update Submission' : 'Open Mission →'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Objectives & Robot Arm Graphic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Objectives Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-4 flex items-center justify-between">
                <span>MISSION OBJECTIVES</span>
                <span className="text-[11px] text-[#FED7AA]/60">
                  {objectives.filter((o) => o.completed).length} / {objectives.length} Complete
                </span>
              </div>

              <div className="space-y-3">
                {objectives.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      obj.completed
                        ? 'bg-[#18261A]/80 border-emerald-500/30 text-[#FFF7ED]'
                        : 'bg-[#190C05]/90 border-amber-500/15 hover:border-amber-500/40 text-[#FED7AA]/90'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {obj.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-amber-500/50" />
                      )}
                    </div>
                    <div className="flex-1 text-sm font-medium leading-snug">
                      <span className={obj.completed ? 'line-through text-stone-300' : ''}>
                        {obj.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-amber-500/15 flex items-center justify-between">
                <span className="text-xs text-[#FED7AA]/70 font-mono">
                  All team members sync with this objective ledger.
                </span>
                {!isLocked && (
                  <button
                    onClick={onOpenSubmitModal}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-white"
                  >
                    <span>Submit Deliverables</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3 Metric Tiles matching Panel 4: Reward, Time, Submission */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Reward Tile */}
              <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                    REWARD
                  </div>
                  <div className="text-base font-display font-black text-amber-400">
                    +{levelConfig.rewardXP} XP
                  </div>
                </div>
              </div>

              {/* Time Remaining Tile */}
              <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                    TIME REMAINING
                  </div>
                  <div className="text-base font-mono font-black text-[#FFF7ED]">
                    {formattedTime}
                  </div>
                </div>
              </div>

              {/* Submission Status Tile */}
              <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                    SUBMISSION
                  </div>
                  <div className={`text-xs font-bold font-mono ${hasSubmitted ? 'text-emerald-400' : 'text-stone-400'}`}>
                    {hasSubmitted ? '✓ Submitted' : 'Not Submitted'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Robotic Arm Technical Visual matching Panel 4 */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#190C05] group">
              <img
                src="/zero-one/robot-arm.jpg"
                alt="ZERO → ONE Robotic Arm Assembly"
                className="w-full h-[320px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140904] via-transparent to-transparent opacity-80" />

              {/* Technical Telemetry Badge overlay */}
              <div className="absolute top-4 left-4 bg-[#140904]/80 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-xl font-mono text-[10px] text-amber-300">
                SYSTEM: AXIS-6 PROTOTYPE INITIATION
              </div>

              {/* Bottom Quick Action inside image */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#231006]/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    Ready to complete this stage?
                  </div>
                  <div className="text-[11px] text-[#FED7AA]/70">
                    Submit pitch, repo, or prototype evidence.
                  </div>
                </div>
                {!isLocked && (
                  <button
                    onClick={onOpenSubmitModal}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md shadow-amber-500/30 hover:brightness-110 transition-all shrink-0"
                  >
                    Open Mission →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
