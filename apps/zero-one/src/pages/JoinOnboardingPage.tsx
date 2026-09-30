import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { commandSync } from '../services/commandSyncEngine';
import { getLoginUrl } from '../services/mainSiteAuth';
import { SimulationRole } from '../types';
import {
  Users,
  Shield,
  Briefcase,
  TrendingUp,
  Cpu,
  Megaphone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  Award,
} from 'lucide-react';
import { CodeScrietLogo } from '../components/CodeScrietLogo';

interface JoinOnboardingPageProps {
  onNavigate: (view: string) => void;
}

export const JoinOnboardingPage: React.FC<JoinOnboardingPageProps> = ({ onNavigate }) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    currentTeam,
    teams,
    setCurrentTeamId,
    isLoggedIn,
  } = useSimulation();

  const [step, setStep] = useState<number>(1);
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>(currentTeam.teamCode);
  const [selectedRole, setSelectedRole] = useState<SimulationRole>(
    currentRole === 'CEO' || currentRole === 'CFO' || currentRole === 'CTO' || currentRole === 'CMO'
      ? currentRole
      : 'CEO'
  );
  const [deviceName, setDeviceName] = useState<string>('Founder Primary Device (Bound)');
  const [joinedSuccess, setJoinedSuccess] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const roles: {
    role: SimulationRole;
    title: string;
    icon: React.ReactNode;
    color: string;
    desc: string;
    duties: string[];
  }[] = [
    {
      role: 'CEO',
      title: 'Chief Executive Officer',
      icon: <Briefcase className="w-5 h-5 text-orange-500" />,
      color: 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20',
      desc: 'Overall vision, final approvals, crisis strategy, investor pitching.',
      duties: ['Approve CFO purchases', 'Represent startup in pitch defense', 'Decide trade deals'],
    },
    {
      role: 'CFO',
      title: 'Chief Financial Officer',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
      desc: 'Treasury operations, capital deployment, market buying, burn-rate control.',
      duties: ['Manage ₹10,00,000 capital', 'Propose resource purchases', 'Track unit economics'],
    },
    {
      role: 'CTO',
      title: 'Chief Technology Officer',
      icon: <Cpu className="w-5 h-5 text-blue-500" />,
      color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
      desc: 'Product architecture, cloud infrastructure, prototype readiness.',
      duties: ['Evaluate cloud & tech market assets', 'Submit prototype link', 'Mitigate tech debt'],
    },
    {
      role: 'CMO',
      title: 'Chief Marketing Officer',
      icon: <Megaphone className="w-5 h-5 text-purple-500" />,
      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
      desc: 'Go-to-market execution, viral loops, branding, user acquisition metrics.',
      duties: ['Deploy marketing campaigns', 'Acquire waitlist customers', 'Analyze competitor intel'],
    },
  ];

  const handleComplete = () => {
    // Joining binds a real identity: guests must sign in first so the server
    // can attribute the device, role, and ledger actions to their email.
    if (!isLoggedIn || !currentUser.email) {
      setJoinError('Sign in first — your squad role is bound to your verified email.');
      return;
    }
    setJoinError(null);
    // Sync selected team
    const teamFound = teams.find((t) => t.teamCode === selectedTeamCode);
    const targetTeamId = teamFound ? teamFound.id : currentTeam.id;
    if (teamFound) {
      setCurrentTeamId(teamFound.id);
    }
    setCurrentRole(selectedRole);

    // Dispatch authoritative server commands WITH identity metadata so the
    // backend attributes the device/role to this user (previously these went
    // out anonymous and the server could not tie them to anyone).
    const identity = {
      userId: currentUser.id,
      userEmail: currentUser.email,
      teamId: targetTeamId,
      role: selectedRole,
    };

    commandSync.dispatch('CLAIM_TEAM', {
      teamId: targetTeamId,
      teamCode: selectedTeamCode,
      userId: currentUser.id,
      userName: currentUser.name,
    }, identity);

    commandSync.dispatch('CLAIM_ROLE', {
      teamId: targetTeamId,
      role: selectedRole,
      userId: currentUser.id,
      userName: currentUser.name,
    }, identity);

    commandSync.dispatch('BIND_DEVICE', {
      teamId: targetTeamId,
      role: selectedRole,
      deviceName: deviceName || 'Founder Primary Device (Bound)',
      userId: currentUser.id,
    }, identity);

    setJoinedSuccess(true);
    setTimeout(() => {
      onNavigate('team-dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-stone-200 dark:border-stone-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Event Registration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
              Join ZERO → ONE
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Single Sign-On recognized via <strong className="text-stone-800 dark:text-stone-200">codescriet.dev</strong>. Form squad, select role, bind device.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 flex-shrink-0">
            <CodeScrietLogo size={36} showText={false} />
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{currentUser.name}</div>
              <div className="text-[11px] text-stone-500 font-mono">{currentUser.email || 'not signed in'}</div>
              {isLoggedIn ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">● Session Active</span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">● Sign-in required</span>
              )}
            </div>
          </div>
        </div>

        {/* Multi-step Flow */}
        <div className="flex items-center justify-between px-2">
          {[
            { num: 1, label: 'Capital Track' },
            { num: 2, label: 'Squad Formation' },
            { num: 3, label: 'Role Selection' },
            { num: 4, label: 'Device Binding' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`cursor-pointer flex items-center gap-2 text-xs font-bold ${
                step === s.num
                  ? 'text-orange-600 dark:text-orange-400'
                  : step > s.num
                  ? 'text-stone-900 dark:text-stone-100'
                  : 'text-stone-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  step === s.num
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Capital Track */}
        {step === 1 && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                1. Seed Capital Allocation Track
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Every qualifying squad receives standard authoritative starting capital from the Code.SCRIET reserve.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border-2 border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge badge-orange font-bold text-xs">Standard Track</span>
                  <Award className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
                  ₹ 10,00,000
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Authoritative initial virtual balance credited to team append-only financial ledger.
                </p>
                <div className="pt-2 border-t border-orange-200/50 dark:border-orange-800/50 text-[11px] text-stone-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Double-spending protection & idempotent transactions</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge badge-stone text-xs">Simulation Constraints</span>
                  <Shield className="w-5 h-5 text-stone-400" />
                </div>
                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">●</span>
                    <span>Max squad size: 3–5 student founders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">●</span>
                    <span>Single authoritative role per member</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">●</span>
                    <span>Full round synchronization with live screen</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setStep(2)}
                className="btn-primary text-sm py-3 px-6 flex items-center gap-2"
              >
                <span>Continue to Squad Formation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Squad Formation */}
        {step === 2 && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                2. Form or Join Squad
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Enter your team code or pick from the official registered startup rosters.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">
                Select Startup Squad
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamCode(t.teamCode)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedTeamCode === t.teamCode
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {t.name}
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        Code: {t.teamCode} • {t.members.length} Members
                      </div>
                    </div>
                    {selectedTeamCode === t.teamCode && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary text-sm py-3 px-6 flex items-center gap-2"
              >
                <span>Continue to Role Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Role Selection */}
        {step === 3 && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                3. Choose Your Operational Role
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Each founder role grants distinct authoritative powers during simulation rounds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((r) => (
                <div
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    selectedRole === r.role
                      ? `${r.color} shadow-md`
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-white dark:bg-stone-900 shadow-sm">
                        {r.icon}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                          {r.role}
                        </div>
                        <div className="text-[11px] text-stone-500">{r.title}</div>
                      </div>
                    </div>
                    {selectedRole === r.role && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {r.desc}
                  </p>

                  <div className="space-y-1 pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
                    {r.duties.map((duty, idx) => (
                      <div key={idx} className="text-[11px] text-stone-500 flex items-center gap-1.5">
                        <span className="text-orange-500">✓</span>
                        <span>{duty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-primary text-sm py-3 px-6 flex items-center gap-2"
              >
                <span>Continue to Device Binding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Device Binding & Confirmation */}
        {step === 4 && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                4. Device Binding & Rules Protocol
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Zero One links one operational device per founder role to guarantee integrity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    Device Fingerprint Binding
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    ID: DEV-{Math.random().toString(36).substring(2, 9).toUpperCase()} • Browser Verified
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Device Label
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="input-text text-xs"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
              <div className="font-bold">Authoritative Rule Confirmation:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Ledger transactions cannot be deleted; balance changes are audit-logged.</li>
                <li>CEO approvals required for market purchases above threshold.</li>
                <li>Timer is synchronized centrally with SCRIET event server.</li>
              </ul>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                ← Back
              </button>
              {!isLoggedIn ? (
                <div className="flex-1 ml-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/60 space-y-2.5">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Authentication required to bind your squad role
                  </div>
                  <p className="text-[11px] text-stone-500">
                    ZERO → ONE uses centralized authentication via codescriet.dev. Sign in with your Code.SCRIET account:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={getLoginUrl(typeof window !== 'undefined' ? window.location.href : undefined)}
                      className="btn-primary text-xs py-2.5 px-6 text-center inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Continue with Code.SCRIET</span>
                    </a>
                  </div>
                  {joinError && (
                    <div className="text-[11px] font-semibold text-red-600 dark:text-red-400">{joinError}</div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  className="btn-primary text-sm py-3 px-8 flex items-center gap-2 shadow-lg shadow-orange-500/25"
                >
                  {joinedSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span>Entering Simulation Hub...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Enter Simulation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
