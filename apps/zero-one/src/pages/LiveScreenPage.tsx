import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Trophy, Clock, Flame, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

interface LiveScreenPageProps {
  onNavigate: (view: string) => void;
}

export const LiveScreenPage: React.FC<LiveScreenPageProps> = ({ onNavigate }) => {
  const {
    teams,
    eventStatus,
    serverTimeRemainingSeconds,
    marketItems,
    announcements,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'CRISIS_GRID'>('LEADERBOARD');

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Seeded mock scores matching Screenshot 6 exactly:
  const leaderboardData = [
    { rank: 1, name: 'InnovateX', code: 'Team 07', capital: 920000, health: 82, score: 420 },
    { rank: 2, name: 'TechNova', code: 'Team 01', capital: 840000, health: 76, score: 388 },
    { rank: 3, name: 'AgriNext', code: 'Team 02', capital: 780000, health: 71, score: 365 },
    { rank: 4, name: 'CodeCatalyst', code: 'Team 03', capital: 690000, health: 68, score: 330 },
    { rank: 5, name: 'Visionary', code: 'Team 04', capital: 610000, health: 64, score: 310 },
    { rank: 6, name: 'NexGen', code: 'Team 05', capital: 580000, health: 61, score: 298 },
    { rank: 7, name: 'StartSphere', code: 'Team 06', capital: 510000, health: 58, score: 276 },
    { rank: 8, name: 'FutureFounders', code: 'Team 08', capital: 490000, health: 54, score: 260 },
    { rank: 9, name: 'Ideatech', code: 'Team 09', capital: 420000, health: 51, score: 240 },
    { rank: 10, name: 'BuildLoop', code: 'Team 10', capital: 380000, health: 48, score: 220 },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 p-4 sm:p-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Projector Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                Live Leaderboard
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Live Update
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Official Auditorium Screen • {eventStatus.replace('_', ' ')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-full border border-stone-200 dark:border-stone-800 text-xs">
              <button
                onClick={() => setActiveTab('LEADERBOARD')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  activeTab === 'LEADERBOARD'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('CRISIS_GRID')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  activeTab === 'CRISIS_GRID'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Live Crisis Grid
              </button>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono text-orange-600 dark:text-orange-500">
                {formatTimer(serverTimeRemainingSeconds)}
              </div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Official Clock
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'LEADERBOARD' ? (
          /* Table matching Screenshot 6 */
          <div className="card overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs uppercase tracking-wider font-bold text-stone-500">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-6">Team</th>
                    <th className="py-3.5 px-6">Capital</th>
                    <th className="py-3.5 px-6">Health</th>
                    <th className="py-3.5 px-6 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {leaderboardData.map((t) => (
                    <tr
                      key={t.rank}
                      className="hover:bg-orange-50/40 dark:hover:bg-stone-900/40 transition-colors"
                    >
                      {/* Rank badge */}
                      <td className="py-3.5 px-4 text-center">
                        {t.rank === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs inline-flex items-center justify-center shadow-md">
                            1
                          </span>
                        ) : t.rank === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-stone-300 text-stone-900 font-black text-xs inline-flex items-center justify-center shadow-md">
                            2
                          </span>
                        ) : t.rank === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs inline-flex items-center justify-center shadow-md">
                            3
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-stone-400">
                            {t.rank}
                          </span>
                        )}
                      </td>

                      {/* Team Name */}
                      <td className="py-3.5 px-6 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{t.name}</span>
                        {t.rank === 1 && (
                          <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </td>

                      {/* Capital */}
                      <td className="py-3.5 px-6 font-mono font-bold text-stone-800 dark:text-stone-200">
                        ₹ {t.capital.toLocaleString('en-IN')}
                      </td>

                      {/* Health */}
                      <td className="py-3.5 px-6 font-mono font-bold">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                            t.health >= 70
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {t.health}%
                        </span>
                      </td>

                      {/* Composite Score */}
                      <td className="py-3.5 px-6 text-right font-mono font-black text-base text-orange-600 dark:text-orange-500">
                        {t.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Live Crisis Grid matching Rule 49 */
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { code: 'TEAM 01', status: '04:52', color: 'text-red-500' },
                { code: 'TEAM 02', status: '04:49', color: 'text-red-500' },
                { code: 'TEAM 03', status: 'RESPONDED', color: 'text-emerald-500' },
                { code: 'TEAM 04', status: '03:11', color: 'text-red-500' },
                { code: 'TEAM 05', status: 'RESPONDED', color: 'text-emerald-500' },
                { code: 'TEAM 06', status: '04:15', color: 'text-red-500' },
                { code: 'TEAM 07', status: 'RESPONDED', color: 'text-emerald-500' },
                { code: 'TEAM 08', status: '02:40', color: 'text-red-500' },
              ].map((gridItem, idx) => (
                <div
                  key={idx}
                  className="card p-5 text-center space-y-1.5 border-2 border-stone-200 dark:border-stone-800"
                >
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {gridItem.code}
                  </div>
                  <div className={`text-xl font-black font-mono ${gridItem.color}`}>
                    {gridItem.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Market Ticker marquee */}
        <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden flex items-center gap-4 text-xs font-semibold">
          <span className="font-bold text-orange-600 flex items-center gap-1 flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
            MARKET TICKER:
          </span>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-stone-600 dark:text-stone-300">
            {marketItems.map((item) => (
              <span key={item.sku} className="font-mono">
                {item.name}: ₹{item.currentPrice.toLocaleString('en-IN')}{' '}
                {item.priceChangePct !== 0 && (
                  <span className={item.priceChangePct > 0 ? 'text-red-500' : 'text-emerald-500'}>
                    ({item.priceChangePct > 0 ? '+' : ''}{item.priceChangePct}%)
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
