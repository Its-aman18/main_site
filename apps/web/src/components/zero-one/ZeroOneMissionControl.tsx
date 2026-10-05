import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  Lock,
  Users,
  User,
  FileText,
  Activity,
  Megaphone,
  Edit,
  Award,
} from 'lucide-react';
import type { CompetitionRoundPreview, EventTeam } from '@/lib/api';
import { ZERO_ONE_LEVELS } from './types';
import { zoStyles } from './zeroOneTheme';

interface ZeroOneMissionControlProps {
  rounds: CompetitionRoundPreview[];
  teams: EventTeam[];
  onStartRound: (roundId: string) => Promise<void>;
  onLockRound: (roundId: string) => Promise<void>;
  onJudgingRound: (roundId: string) => Promise<void>;
  onFinishRound: (roundId: string) => Promise<void>;
  onLockTeam?: (teamId: string) => Promise<void>;
  onSendAnnouncement?: (message: string) => void;
  activeLevelNumber?: number;
}

export const ZeroOneMissionControl: React.FC<ZeroOneMissionControlProps> = ({
  rounds,
  teams,
  onStartRound,
  onLockRound,
  onJudgingRound,
  onFinishRound,
  onLockTeam,
  onSendAnnouncement,
  activeLevelNumber = 3,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'levels' | 'teams' | 'submissions'>('overview');
  const [announcementText, setAnnouncementText] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const activeRound = rounds.find((r) => r.status === 'ACTIVE') || rounds[0];

  const handleAction = async (actionName: string, fn: () => Promise<void>) => {
    setActionLoading(actionName);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  const handleBroadcast = () => {
    if (!announcementText.trim()) return;
    if (onSendAnnouncement) onSendAnnouncement(announcementText);
    setAnnouncementText('');
    setShowAnnouncementModal(false);
  };

  return (
    <div className="w-full bg-[#140904] text-[#FFF7ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header matching Panel 8 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <span>EXECUTIVE GAME MASTER CONSOLE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#FFF7ED]">
              MISSION CONTROL
            </h1>
            <p className="text-sm text-[#FED7AA]/80">
              Manage event, participants, teams and levels in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#220F06] border border-amber-500/30 px-3.5 py-1.5 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">EVENT STATUS: LIVE</span>
            </div>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Send Announcement</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards matching Panel 8 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-[#FFF7ED]">
                248
              </div>
              <div className="text-xs font-mono uppercase text-[#FED7AA]/70">
                Total Participants
              </div>
            </div>
          </div>

          <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {teams.length > 0 ? teams.length : 62}
              </div>
              <div className="text-xs font-mono uppercase text-[#FED7AA]/70">
                Total Teams
              </div>
            </div>
          </div>

          <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-[#FFF7ED]">
                184
              </div>
              <div className="text-xs font-mono uppercase text-[#FED7AA]/70">
                Submissions
              </div>
            </div>
          </div>

          <div className="bg-[#210F06] border border-amber-500/20 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">
                41
              </div>
              <div className="text-xs font-mono uppercase text-[#FED7AA]/70">
                Active Teams
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: ACTIVE LEVEL Card (6 cols) & QUICK ACTIONS (6 cols) matching Panel 8 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Active Level Control Card matching Panel 8 */}
          <div className="md:col-span-6 bg-[#210F06] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                ACTIVE LEVEL CONTROL
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                ● LIVE STAGE
              </span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/30">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#FED7AA]/60">CURRENT BROADCAST</div>
                <div className="text-2xl font-display font-black text-[#FFF7ED]">
                  Level 0{activeLevelNumber} • {ZERO_ONE_LEVELS[activeLevelNumber - 1]?.title || 'VALIDATE'}
                </div>
                <div className="text-xs text-[#FED7AA]/80 mt-0.5">
                  {ZERO_ONE_LEVELS[activeLevelNumber - 1]?.subtitle || 'Test with real users and get feedback'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/15">
              {activeRound && (
                <>
                  {activeRound.status !== 'ACTIVE' ? (
                    <button
                      onClick={() => handleAction('start', () => onStartRound(activeRound.id))}
                      disabled={actionLoading === 'start'}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/30"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Open Level</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('lock', () => onLockRound(activeRound.id))}
                      disabled={actionLoading === 'lock'}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Level</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleAction('judging', () => onJudgingRound(activeRound.id))}
                    disabled={actionLoading === 'judging'}
                    className="px-4 py-2 rounded-xl bg-[#2E1408] border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-semibold"
                  >
                    Start Judging
                  </button>

                  <button
                    onClick={() => handleAction('finish', () => onFinishRound(activeRound.id))}
                    disabled={actionLoading === 'finish'}
                    className="px-4 py-2 rounded-xl bg-[#2E1408] border border-amber-500/30 hover:border-amber-400 text-emerald-400 text-xs font-semibold"
                  >
                    Complete Level
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions Card matching Panel 8 */}
          <div className="md:col-span-6 bg-[#210F06] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              QUICK ACTIONS
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('teams')}
                className="p-3.5 rounded-2xl bg-[#190C05] border border-amber-500/20 hover:border-amber-400 flex items-center gap-3 transition-all text-left"
              >
                <Users className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#FFF7ED]">Manage Teams</div>
                  <div className="text-[10px] text-[#FED7AA]/60">Roster & lock status</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('submissions')}
                className="p-3.5 rounded-2xl bg-[#190C05] border border-amber-500/20 hover:border-amber-400 flex items-center gap-3 transition-all text-left"
              >
                <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#FFF7ED]">View Submissions</div>
                  <div className="text-[10px] text-[#FED7AA]/60">Code & prototype links</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('levels')}
                className="p-3.5 rounded-2xl bg-[#190C05] border border-amber-500/20 hover:border-amber-400 flex items-center gap-3 transition-all text-left"
              >
                <Edit className="w-5 h-5 text-yellow-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#FFF7ED]">Level Controls</div>
                  <div className="text-[10px] text-[#FED7AA]/60">Unlock or reset rounds</div>
                </div>
              </button>

              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="p-3.5 rounded-2xl bg-[#190C05] border border-amber-500/20 hover:border-amber-400 flex items-center gap-3 transition-all text-left"
              >
                <Megaphone className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#FFF7ED]">Send Announcement</div>
                  <div className="text-[10px] text-[#FED7AA]/60">Real-time alert push</div>
                </div>
              </button>
            </div>

            <div className="text-[11px] font-mono text-[#FED7AA]/60 text-right pt-2 border-t border-amber-500/10">
              Changes reflect immediately on participant screens.
            </div>
          </div>
        </div>

        {/* Tab Controls: Levels List / Teams List */}
        <div className="bg-[#210F06] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-500/15 pb-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-[#FED7AA]/70 hover:text-white'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'teams'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-[#FED7AA]/70 hover:text-white'
              }`}
            >
              Squad Roster ({teams.length})
            </button>
          </div>

          {/* All Levels List */}
          {activeTab === 'overview' || activeTab === 'levels' ? (
            <div className="space-y-3">
              {ZERO_ONE_LEVELS.map((lvl) => {
                const matchRound = rounds[lvl.levelNumber - 1];
                const roundStatus = matchRound ? matchRound.status : lvl.defaultStatus;

                return (
                  <div
                    key={lvl.levelNumber}
                    className="p-4 rounded-2xl bg-[#180B04] border border-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#291308] border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                        0{lvl.levelNumber}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#FFF7ED] flex items-center gap-2">
                          <span>{lvl.title}</span>
                          <span className="text-[10px] font-mono text-[#FED7AA]/60">
                            ({lvl.subtitle})
                          </span>
                        </div>
                        <div className="text-xs text-[#FED7AA]/60 mt-0.5">
                          Status: <strong className="text-amber-400">{roundStatus}</strong> • Reward: +{lvl.rewardXP} XP
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {matchRound ? (
                        <>
                          <button
                            onClick={() => handleAction(`start-${matchRound.id}`, () => onStartRound(matchRound.id))}
                            className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-mono font-semibold"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleAction(`lock-${matchRound.id}`, () => onLockRound(matchRound.id))}
                            className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono font-semibold"
                          >
                            Lock
                          </button>
                          <button
                            onClick={() => handleAction(`finish-${matchRound.id}`, () => onFinishRound(matchRound.id))}
                            className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 font-mono font-semibold"
                          >
                            Complete
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-stone-500 font-mono">
                          Simulated Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Teams List */
            <div className="space-y-3">
              {teams.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs font-mono">
                  No registered teams found in the database.
                </div>
              ) : (
                teams.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#180B04] border border-amber-500/15 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#FFF7ED]">
                        {t.teamName}
                      </div>
                      <div className="text-xs text-[#FED7AA]/60 font-mono">
                        Invite Code: {t.inviteCode} • Leader: {t.leaderId}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {t.isLocked ? 'Locked' : 'Active'}
                      </span>
                      {onLockTeam && (
                        <button
                          onClick={() => handleAction(`lock-team-${t.id}`, () => onLockTeam(t.id))}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[#2E1408] border border-amber-500/30 hover:border-amber-400 text-amber-300 font-mono"
                        >
                          {t.isLocked ? 'Unlock' : 'Lock'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#241006] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-[#FFF7ED]">
                Broadcast Announcement
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#FED7AA]/70">
              This message will immediately broadcast to all participant consoles in the simulation.
            </p>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Flash Market Crisis: Cloud provider outages have increased server costs by 30%. Re-evaluate cash runway in Level 02!"
              rows={4}
              className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl p-3 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                className={zoStyles.btnPrimary}
              >
                Broadcast to Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
