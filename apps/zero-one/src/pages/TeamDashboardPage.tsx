import React from 'react';
import { useSimulation } from '../services/simulationContext';
import { SimulationRole } from '../types';
import {
  LayoutDashboard,
  ShoppingCart,
  AlertTriangle,
  Package,
  FileText,
  Users,
  Receipt,
  Bell,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  CheckCircle,
  ShieldAlert,
  Cpu,
  Megaphone,
  Mic,
  DollarSign,
  Gavel,
  Shield,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react';
import { RunwayHealthIndicator } from '../components/RunwayHealthIndicator';
import { MissionMap } from '../components/MissionMap';

interface TeamDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const TeamDashboardPage: React.FC<TeamDashboardPageProps> = ({ onNavigate }) => {
  const {
    currentTeam,
    currentRole,
    setCurrentRole,
    getBalance,
    inventory,
    ledger,
    eventStatus,
    serverTimeRemainingSeconds,
    activeCrisis,
    announcements,
    purchaseProposals,
    approveProposal,
    rejectProposal,
  } = useSimulation();

  const balance = getBalance();

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pendingApprovals = purchaseProposals.filter(
    (p) => p.status === 'PENDING_CEO_APPROVAL' && p.teamId === currentTeam.id
  );
  const teamInventory = inventory.filter((i) => i.teamId === currentTeam.id);
  const teamLedger = ledger.filter((e) => e.teamId === currentTeam.id);
  const missionNumber = currentTeam.currentRound.match(/\d+/)?.[0] || '01';

  return (
    <div className="zo-game-shell min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 flex pb-16 md:pb-0 transition-colors">
      {/* Sidebar Navigation matching Screenshot 3 */}
      <aside className="w-64 border-r border-[#EFE8DD] dark:border-[#202432] bg-[#FAF8F5] dark:bg-[#0A0C14] hidden md:flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-1.5">
          <div className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
            Mission Control
          </div>

          <button
            onClick={() => onNavigate('team-dashboard')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold bg-orange-500 text-white shadow-md shadow-orange-500/25"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('market')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-orange-500" />
            <span>Market</span>
          </button>

          <button
            onClick={() => onNavigate('crisis')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Crisis</span>
            </div>
            {activeCrisis && activeCrisis.status === 'ACTIVE' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => onNavigate('canvas')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-teal-500" />
            <span>Canvas</span>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span>Inventory</span>
          </button>

          <button
            onClick={() => onNavigate('auction')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Gavel className="w-4 h-4 text-indigo-500" />
            <span>Auction & Trade</span>
          </button>

          <button
            onClick={() => onNavigate('pitch')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Mic className="w-4 h-4 text-pink-500" />
            <span>Pitch & Demo</span>
          </button>

          <button
            onClick={() => onNavigate('transactions')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Receipt className="w-4 h-4 text-stone-500" />
            <span>Ledger</span>
          </button>
        </div>

        {/* Bottom Role Info Card */}
        <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Current Founder Role
          </div>
          <div className="font-extrabold text-orange-600 dark:text-orange-400 mt-0.5 flex items-center gap-1.5">
            {currentRole === 'CEO' && <Briefcase className="w-3.5 h-3.5" />}
            {currentRole === 'CFO' && <TrendingUp className="w-3.5 h-3.5" />}
            {currentRole === 'CTO' && <Cpu className="w-3.5 h-3.5" />}
            {currentRole === 'CMO' && <Megaphone className="w-3.5 h-3.5" />}
            <span>{currentRole}</span>
          </div>
          <div className="text-stone-500 text-[11px] mt-0.5 font-mono">
            {currentTeam.name} ({currentTeam.teamCode})
          </div>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="zo-game-main flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="zo-hud">
        <div className="zo-hud__brand">
          <span className="zo-eyebrow">STARTUP SIMULATION</span>
          <strong>ZERO <em>→</em> ONE</strong>
        </div>
        <div className="zo-hud__mission">
          <span>LEVEL {missionNumber}</span>
          <strong>{currentTeam.currentRound.replace(/^\w+\s*/, '') || 'MISSION ACTIVE'}</strong>
        </div>
        <div className="zo-hud__stats">
          <span><small>TEAM</small>{currentTeam.name}</span>
          <span><small>CAPITAL</small>₹{balance.toLocaleString('en-IN')}</span>
          <span><small>TIME</small>{formatTimer(serverTimeRemainingSeconds)}</span>
        </div>
      </div>
      <MissionMap currentRound={currentTeam.currentRound} />
      <div className="zo-mission-intro">
        <div>
          <span className="zo-eyebrow">CURRENT MISSION / {missionNumber}</span>
          <h2>Take {currentTeam.name} from zero to signal.</h2>
          <p>Your team is the startup. Every purchase, crisis response and pitch decision changes the run.</p>
        </div>
        <div className="zo-status-chip"><i /> MISSION ACTIVE</div>
      </div>
        {/* Welcome Back & Timer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <span className="text-xs font-semibold text-stone-500">Welcome back,</span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                Team {currentTeam.name}
              </h1>
              <span className="badge badge-amber text-xs font-mono font-bold">
                {currentTeam.teamCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{currentTeam.currentRound}</span>
            </div>
          </div>

          {/* Quick Role Switcher Pill for Testing */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider hidden sm:inline">
              Role:
            </span>
            <div className="p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-1">
              {(['CEO', 'CFO', 'CTO', 'CMO'] as SimulationRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setCurrentRole(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentRole === r
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Official Clock Timer Display */}
            <div className="text-right ml-2">
              <div className="text-2xl sm:text-3xl font-black font-mono text-orange-600 dark:text-orange-500">
                {formatTimer(serverTimeRemainingSeconds)}
              </div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Round Clock
              </div>
            </div>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Available Capital */}
          <div className="card p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base flex-shrink-0">
              ₹
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 font-mono">
                ₹ {balance.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-500 font-medium">Available Capital</div>
            </div>
          </div>

          {/* Startup Health */}
          <div className="card p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 font-mono">
                {currentTeam.healthScore}%
              </div>
              <div className="text-[11px] text-stone-500 font-medium">Startup Health</div>
            </div>
          </div>

          {/* Items in Inventory */}
          <div className="card p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 font-mono">
                {teamInventory.length}
              </div>
              <div className="text-[11px] text-stone-500 font-medium">Items in Inventory</div>
            </div>
          </div>

          {/* Active Boosts */}
          <div className="card p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 font-mono">
                2
              </div>
              <div className="text-[11px] text-stone-500 font-medium">Active Boosts</div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ROLE-DEDICATED SECTION: CEO / CFO / CTO / CMO
            ======================================================== */}
        {currentRole === 'CEO' && (
          <div className="card p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-2 border-orange-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500 text-white">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    CEO Command Center
                  </h3>
                  <p className="text-xs text-stone-500">
                    Executive oversight, purchase approvals, crisis leadership & pitch defense.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pitch')}
                className="btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Prepare Pitch Defense →</span>
              </button>
            </div>

            {/* Pending Approvals Queue */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Pending Founder Approvals ({pendingApprovals.length})
              </div>

              {pendingApprovals.length > 0 ? (
                <div className="space-y-2">
                  {pendingApprovals.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {p.itemName}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Proposed by <strong className="text-orange-600">{p.proposedByRole}</strong> • Cost: ₹ {p.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveProposal(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectProposal(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 font-bold text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 text-center text-xs text-stone-500">
                  No pending CFO purchases. All founder operations synchronized.
                </div>
              )}
            </div>
          </div>
        )}

        {currentRole === 'CFO' && (
          <div className="card p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    CFO Treasury & Burn Rate Engine
                  </h3>
                  <p className="text-xs text-stone-500">
                    Capital allocation, runway forecasting, unit economics, market deployment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('market')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Go to Market →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">Projected Burn Rate</div>
                <div className="text-lg font-black font-mono text-stone-900 dark:text-stone-100 mt-0.5">
                  ₹ 65,000 / round
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Within safe boundary</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">Runway Forecast</div>
                <div className="text-lg font-black font-mono text-stone-900 dark:text-stone-100 mt-0.5">
                  15.4 Rounds
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">High capital endurance</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">LTV / CAC Ratio</div>
                <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">
                  12.1x
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">CAC: ₹120 • LTV: ₹1,450</div>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'CTO' && (
          <div className="card p-6 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border-2 border-blue-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500 text-white">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    CTO Tech Stack & Architecture
                  </h3>
                  <p className="text-xs text-stone-500">
                    Cloud infrastructure, prototype link submission, technical debt risk control.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pitch')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span>Submit Prototype Link →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">System Uptime</div>
                <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">99.98%</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Latency: 42ms (India DC)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">Tech Debt Index</div>
                <div className="text-lg font-black font-mono text-stone-900 dark:text-stone-100 mt-0.5">
                  12% (Low Risk)
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Architecture validated</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">CI/CD Deploy Pipeline</div>
                <div className="text-lg font-black font-mono text-blue-600 mt-0.5">Active</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Automated test suites pass</div>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'CMO' && (
          <div className="card p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border-2 border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500 text-white">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    CMO Growth & Traction Funnel
                  </h3>
                  <p className="text-xs text-stone-500">
                    User acquisition campaigns, viral multiplier, brand sentiment & waitlist metrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('market')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span>Deploy Ad Campaigns →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">Waitlist Signups</div>
                <div className="text-lg font-black font-mono text-purple-600 mt-0.5">4,280 Users</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">+340 users in current round</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">Viral Coefficient (K-factor)</div>
                <div className="text-lg font-black font-mono text-stone-900 dark:text-stone-100 mt-0.5">
                  1.42x
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Organic compounding active</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="text-[11px] font-bold text-stone-400">Brand Sentiment</div>
                <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">88 / 100</div>
                <div className="text-[10px] text-stone-400 mt-0.5">High student affinity</div>
              </div>
            </div>
          </div>
        )}

        {/* 4 Interactive Quick Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div
            onClick={() => onNavigate('market')}
            className="card card-interactive p-4 sm:p-5 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
              Market
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Buy resources, hire and grow.
            </p>
          </div>

          <div
            onClick={() => onNavigate('crisis')}
            className="card card-interactive p-4 sm:p-5 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
              Crisis
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Handle unexpected events.
            </p>
          </div>

          <div
            onClick={() => onNavigate('canvas')}
            className="card card-interactive p-4 sm:p-5 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
              Canvas
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Update your startup plan.
            </p>
          </div>

          <div
            onClick={() => onNavigate('pitch')}
            className="card card-interactive p-4 sm:p-5 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
              Pitch
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Shark-tank defense & demo.
            </p>
          </div>
        </div>

        {/* Runway & Composite Health Gauge */}
        <RunwayHealthIndicator />

        {/* Bottom Section: Recent Activity Feed */}
        <div className="card p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100">
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {teamLedger.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      entry.type === 'CREDIT'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                    }`}
                  >
                    {entry.type === 'CREDIT' ? '+' : '-'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {entry.description}
                    </div>
                    <div className="text-xs text-stone-400 font-mono">
                      {entry.actorRole} • {new Date(entry.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-black font-mono ${
                    entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {entry.type === 'CREDIT' ? '+' : '-'}₹ {entry.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar for Seamless Mobile Experience */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#07080B]/95 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => onNavigate('team-dashboard')}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-orange-600"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate('market')}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-600 dark:text-stone-400 hover:text-orange-500"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Market</span>
        </button>
        <button
          onClick={() => onNavigate('crisis')}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-600 dark:text-stone-400 hover:text-red-500 relative"
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Crisis</span>
          {activeCrisis && activeCrisis.status === 'ACTIVE' && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-0 right-1" />
          )}
        </button>
        <button
          onClick={() => onNavigate('canvas')}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-600 dark:text-stone-400 hover:text-teal-500"
        >
          <FileText className="w-4 h-4" />
          <span>Canvas</span>
        </button>
        <button
          onClick={() => onNavigate('pitch')}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-600 dark:text-stone-400 hover:text-pink-500"
        >
          <Mic className="w-4 h-4" />
          <span>Pitch</span>
        </button>
      </nav>
    </div>
  );
};
