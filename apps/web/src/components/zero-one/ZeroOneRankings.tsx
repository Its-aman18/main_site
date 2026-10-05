import React from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardTeamEntry } from './types';

interface ZeroOneRankingsProps {
  teams: LeaderboardTeamEntry[];
  currentTeamName?: string;
}

export const ZeroOneRankings: React.FC<ZeroOneRankingsProps> = ({
  teams,
  currentTeamName = 'Tech Titans',
}) => {
  return (
    <div className="w-full bg-[#140904] text-[#FFF7ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header matching Panel 6 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>LIVE LEADERBOARD ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#FFF7ED]">
              TEAM RANKINGS
            </h1>
            <p className="text-sm text-[#FED7AA]/80 mt-1">
              Top performing teams in ZERO → ONE simulation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-300/80 bg-[#220F06] px-3.5 py-2 rounded-xl border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server Authoritative Scoring</span>
          </div>
        </div>

        {/* 2-Column Grid: Leaderboard Table (8 cols) & Trophy Podium (4 cols) matching Panel 6 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Rankings Table (8 cols) */}
          <div className="lg:col-span-8 bg-[#210F06] border border-amber-500/25 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-amber-500/15 text-[11px] font-mono uppercase tracking-wider text-amber-400/80">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4 text-right">Points (XP)</th>
                    <th className="py-3 px-4 text-center">Level</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10 text-sm">
                  {teams.map((entry) => {
                    const isMyTeam = entry.isCurrentTeam || entry.teamName.toLowerCase() === currentTeamName.toLowerCase();
                    return (
                      <tr
                        key={entry.rank}
                        className={`transition-colors ${
                          isMyTeam
                            ? 'bg-[#2E1408] border-y border-amber-500/50 font-bold'
                            : 'hover:bg-[#281308]/60'
                        }`}
                      >
                        {/* Rank with medal / badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {entry.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 flex items-center justify-center font-bold text-xs">
                              1
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-stone-400/20 border border-stone-300 text-stone-200 flex items-center justify-center font-bold text-xs">
                              2
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/30 border border-amber-600 text-amber-300 flex items-center justify-center font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-stone-400 font-mono text-xs pl-2">
                              {entry.rank}
                            </span>
                          )}
                        </td>

                        {/* Team Name */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isMyTeam ? 'text-amber-300' : 'text-[#FFF7ED]'}`}>
                              {entry.teamName}
                            </span>
                            {isMyTeam && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-amber-400">
                          {entry.points.toLocaleString()}
                        </td>

                        {/* Level */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-xs text-[#FED7AA]/80">
                          0{entry.level}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Golden Trophy Podium Card (4 cols) matching Panel 6 */}
          <div className="lg:col-span-4 bg-[#210F06] border border-amber-500/25 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col items-center text-center space-y-4">
            <div className="relative w-full rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg bg-[#140904]">
              <img
                src="/zero-one/trophy.jpg"
                alt="ZERO → ONE Trophy Podium"
                className="w-full h-[280px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140904]/80 via-transparent to-transparent" />
            </div>

            <div className="space-y-1">
              <div className="text-lg font-display font-black text-amber-300 tracking-wider">
                COMPETE • COLLABORATE • CREATE
              </div>
              <div className="text-xs uppercase font-mono text-amber-400 tracking-widest">
                FROM ZERO TO ONE
              </div>
            </div>

            <p className="text-xs text-[#FED7AA]/70 leading-relaxed">
              Teams scale up the leaderboard by completing mission deliverables, solving startup crisis events, and presenting executive defenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
