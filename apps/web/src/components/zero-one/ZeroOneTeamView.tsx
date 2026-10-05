import React, { useState } from 'react';
import {
  Users,
  Shield,
  Edit3,
  Copy,
  Check,
  Mail,
  Award,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { zoStyles } from './zeroOneTheme';

interface TeamMemberItem {
  id: string;
  name: string;
  email?: string;
  role: 'Leader' | 'Member';
  avatar?: string | null;
  status: 'Active' | 'Idle' | 'Offline';
}

interface ZeroOneTeamViewProps {
  teamName: string;
  teamCode: string;
  inviteCode: string;
  leaderName: string;
  leaderEmail: string;
  leaderAvatar?: string | null;
  members: TeamMemberItem[];
  currentLevel: number;
  totalPoints: number;
  rank: string;
  levelsCompleted: number;
  onEditTeam?: () => void;
}

export const ZeroOneTeamView: React.FC<ZeroOneTeamViewProps> = ({
  teamName,
  teamCode,
  inviteCode,
  leaderName,
  leaderEmail,
  leaderAvatar,
  members,
  currentLevel,
  totalPoints,
  rank,
  levelsCompleted,
  onEditTeam,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#140904] text-[#FFF7ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header matching Panel 5 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span>SQUAD SATELLITE HUB</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#FFF7ED]">
              TEAM
            </h1>
            <p className="text-sm text-[#FED7AA]/80 mt-1">
              Manage your team, track progress and collaborate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#220F06] border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:text-white transition-all text-xs font-mono"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Invite Code' : `Invite Code: ${inviteCode || 'N/A'}`}</span>
            </button>

            {onEditTeam && (
              <button
                onClick={onEditTeam}
                className={zoStyles.btnSecondary}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                <span>Edit Team</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Team Roster & Team Stats matching Panel 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Team Roster */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#220F06] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
              {/* Squad Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/25">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-black text-[#FFF7ED]">
                      {teamName || 'TECH TITANS'}
                    </h2>
                    <div className="text-xs font-mono text-amber-400/80">
                      Team ID: {teamCode || '2T-001'}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  ● ACTIVE SQUAD
                </span>
              </div>

              {/* Team Leader Section */}
              <div className="bg-[#180B04] border border-amber-500/20 rounded-2xl p-4">
                <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold mb-2">
                  TEAM LEADER
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {leaderAvatar ? (
                      <img
                        src={leaderAvatar}
                        alt={leaderName}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-sm">
                        {leaderName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-[#FFF7ED]">
                        {leaderName}
                      </div>
                      <div className="text-xs text-[#FED7AA]/60 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-amber-500/60" />
                        <span>{leaderEmail}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    LEADER
                  </span>
                </div>
              </div>

              {/* Team Members List */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-between">
                  <span>TEAM MEMBERS ({members.length}/5)</span>
                  <span className="text-[11px] text-[#FED7AA]/60 font-sans">
                    Squad Cap: 5 Members
                  </span>
                </div>

                <div className="space-y-2.5">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-[#180B04] border border-amber-500/15 rounded-2xl p-3.5 flex items-center justify-between hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#2F1508] border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-300">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#FFF7ED]">
                            {member.name}
                          </div>
                          {member.email && (
                            <div className="text-xs text-[#FED7AA]/60 font-mono">
                              {member.email}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): TEAM STATS Card matching Panel 5 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#220F06] border border-amber-500/25 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold border-b border-amber-500/15 pb-3">
                TEAM STATS
              </div>

              <div className="space-y-4">
                {/* Current Level */}
                <div className="bg-[#180B04] p-4 rounded-2xl border border-amber-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                        CURRENT LEVEL
                      </div>
                      <div className="text-lg font-display font-black text-[#FFF7ED]">
                        Level 0{currentLevel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Points */}
                <div className="bg-[#180B04] p-4 rounded-2xl border border-amber-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                        TOTAL POINTS
                      </div>
                      <div className="text-lg font-display font-black text-amber-400">
                        {totalPoints.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank */}
                <div className="bg-[#180B04] p-4 rounded-2xl border border-amber-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                        TEAM RANK
                      </div>
                      <div className="text-lg font-display font-black text-amber-300">
                        {rank}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Levels Completed */}
                <div className="bg-[#180B04] p-4 rounded-2xl border border-amber-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#FED7AA]/60">
                        LEVELS COMPLETED
                      </div>
                      <div className="text-lg font-display font-black text-[#FFF7ED]">
                        {levelsCompleted} / 5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
