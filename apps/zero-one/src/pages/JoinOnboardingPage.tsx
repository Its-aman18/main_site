import React, { useState, useEffect } from 'react';
import { useSimulation } from '../services/simulationContext';
import { getLoginUrl } from '../services/mainSiteAuth';
import { SimulationRole } from '../types';
import {
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
  AlertCircle,
  Users,
  RefreshCw,
  ExternalLink,
  Lock,
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
    isLoggedIn,
    authState,
    zeroOneContext,
    fetchZeroOneContext,
    claimSimulationRole,
    bindSimulationDevice,
    loginWithCredentials,
  } = useSimulation();

  // Multi-step: Step 1 = Role Selection, Step 2 = Device Binding
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<SimulationRole>(() => {
    if (
      currentRole === 'CEO' ||
      currentRole === 'CFO' ||
      currentRole === 'CTO' ||
      currentRole === 'CMO'
    ) {
      return currentRole;
    }
    return 'CEO';
  });

  const [deviceId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('zero_one_device_id');
      if (stored) return stored;
      const gen = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('zero_one_device_id', gen);
      return gen;
    } catch {
      return 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
  });

  const [deviceName, setDeviceName] = useState<string>('Founder Primary Device (Bound)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [joinedSuccess, setJoinedSuccess] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Sync zero-one context on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchZeroOneContext();
    }
  }, [isLoggedIn, fetchZeroOneContext]);

  // If role is already assigned to participant in context, sync state
  useEffect(() => {
    if (zeroOneContext?.participant?.role) {
      setSelectedRole(zeroOneContext.participant.role);
    }
  }, [zeroOneContext]);

  const rolesConfig: {
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

  const handleRoleSelection = (role: SimulationRole) => {
    setJoinError(null);
    const roleKey = role as 'CEO' | 'CFO' | 'CTO' | 'CMO';
    const roleInfo = zeroOneContext?.roles ? zeroOneContext.roles[roleKey] : null;
    const isAssignedToOther =
      roleInfo &&
      roleInfo.assigned &&
      !roleInfo.isCurrent;

    if (isAssignedToOther) {
      setJoinError(`The ${role} role is already assigned to ${roleInfo.assignedToName || 'a teammate'}. Please select an available role.`);
      return;
    }

    setSelectedRole(role);
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setJoinError(null);

    // If not logged in, auto-login with default team credentials
    if (!isLoggedIn || !currentUser.email) {
      const emailForRole =
        selectedRole === 'CFO' ? 'sneha@scriet.edu' :
        selectedRole === 'CTO' ? 'vikram@scriet.edu' :
        selectedRole === 'CMO' ? 'divya@scriet.edu' : 'arjun@scriet.edu';
      await loginWithCredentials(emailForRole, 'ZeroOne#2026');
    }

    // 1. Claim operational role
    const roleResult = await claimSimulationRole(selectedRole);
    if (!roleResult.success) {
      setIsSubmitting(false);
      setJoinError(roleResult.error || 'Failed to claim role. Another teammate may have claimed it.');
      setStep(1); // Return to role selection
      return;
    }

    // 2. Bind device session
    const bindResult = await bindSimulationDevice(deviceId, deviceName);
    if (!bindResult.success) {
      setIsSubmitting(false);
      setJoinError(bindResult.error || 'Failed to bind device.');
      return;
    }

    setCurrentRole(selectedRole);
    setJoinedSuccess(true);
    setTimeout(() => {
      onNavigate('team-dashboard');
    }, 1000);
  };

  // Check state conditions
  const isAuthLoading = authState === 'AUTH_LOADING';
  const isRegistered = zeroOneContext?.registration?.registered;
  const registrationStatus = zeroOneContext?.registration?.status;
  const resolvedTeam = zeroOneContext?.team;
  const registeredMembers = resolvedTeam?.members || currentTeam?.members || [];

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
              Team and registration synced automatically. Choose your founder role and enter the simulation arena.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 flex-shrink-0">
            <CodeScrietLogo size={36} showText={false} />
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{currentUser.name || 'Arjun Patel'}</div>
              <div className="text-[11px] text-stone-500 font-mono">{currentUser.email || 'arjun@scriet.edu'}</div>
              {isLoggedIn ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">● Squad Active & Verified</span>
              ) : (
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">● Simulation Ready</span>
              )}
            </div>
          </div>
        </div>

        {/* Status Flow Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
          {/* Verified Status 1: Registration */}
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-mono font-bold shadow-sm">
              ✓
            </div>
            <span>Registration Verified</span>
          </div>

          {/* Verified Status 2: Team */}
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-mono font-bold shadow-sm">
              ✓
            </div>
            <span>Team Loaded</span>
          </div>

          {/* Step 1: Role Selection */}
          <div
            onClick={() => setStep(1)}
            className={`cursor-pointer flex items-center gap-2 text-xs font-bold ${
              step === 1
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-stone-900 dark:text-stone-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                step === 1
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              1
            </div>
            <span>Role Selection</span>
          </div>

          {/* Step 2: Device Binding */}
          <div
            onClick={() => setStep(2)}
            className={`cursor-pointer flex items-center gap-2 text-xs font-bold ${
              step === 2
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-stone-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                step === 2
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
              }`}
            >
              2
            </div>
            <span>Device Binding</span>
          </div>
        </div>

        {/* Error notification banner */}
        {joinError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-red-700 dark:text-red-400 text-xs font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">{joinError}</div>
          </div>
        )}

        {/* QUICK DEMO LOGIN BANNER IF NOT LOGGED IN */}
        {!isLoggedIn && (
          <div className="card p-5 sm:p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border-orange-400/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Demo Sign-In</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Select a persona below or pick your role directly. Onboarding will auto-link your squad!
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loginWithCredentials('arjun@scriet.edu', 'ZeroOne#2026')}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                >
                  <span>🚀 Team Leader (Arjun)</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginWithCredentials('admin@example.com', 'change_this_password')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  <span>🛡️ Super Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONDITION: READY FOR ONBOARDING (ALWAYS OPEN) */}
        {true && (
          <>
            {/* Informational Authoritative Registered Startup Card */}
            <div className="card p-6 sm:p-8 space-y-6 border-stone-200 dark:border-stone-800 bg-gradient-to-br from-stone-50/80 to-stone-100/40 dark:from-stone-900/60 dark:to-stone-950/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    YOUR REGISTERED STARTUP
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100">
                      {resolvedTeam?.name || currentTeam?.name || 'InnovateX'}
                    </h2>
                    <span className="badge badge-orange font-mono font-bold text-xs">
                      {resolvedTeam?.code || currentTeam?.teamCode || 'TEAM07'}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Starting Simulation Capital
                  </span>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ₹ 10,00,000
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Automatically allocated by ZERO → ONE event configuration
                  </span>
                </div>
              </div>

              {/* Registered Team Members Roster Chip List */}
              <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>
                      {registeredMembers.length} Registered {registeredMembers.length === 1 ? 'Founder' : 'Founders'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Synced with main_site</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {registeredMembers.map((member: any) => {
                    const isSelf = member.email?.toLowerCase() === currentUser.email?.toLowerCase();
                    return (
                      <div
                        key={member.id || member.email}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                          isSelf
                            ? 'bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200 font-bold'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <CheckCircle className={`w-3.5 h-3.5 ${isSelf ? 'text-orange-600' : 'text-emerald-500'}`} />
                        <span>{member.name || member.displayName}</span>
                        {member.role === 'LEADER' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            Leader
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-200 dark:bg-orange-900/80 text-orange-800 dark:text-orange-300">
                            You
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="card p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                      1. Choose Your Operational Role
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Roles are team-scoped. Select an available founder role for the simulation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rolesConfig.map((r) => {
                    const roleKey = r.role as 'CEO' | 'CFO' | 'CTO' | 'CMO';
                    const roleInfo = zeroOneContext?.roles ? zeroOneContext.roles[roleKey] : null;
                    const isAssigned = Boolean(roleInfo?.assigned);
                    const isAssignedToMe = isAssigned && Boolean(roleInfo?.isCurrent);
                    const isAssignedToOther = isAssigned && !isAssignedToMe;
                    const isSelected = selectedRole === r.role;

                    return (
                      <div
                        key={r.role}
                        onClick={() => !isAssignedToOther && handleRoleSelection(r.role)}
                        className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                          isAssignedToOther
                            ? 'opacity-60 bg-stone-100/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 cursor-not-allowed'
                            : isSelected
                            ? `${r.color} cursor-pointer shadow-md`
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer'
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

                          {/* Role status badge */}
                          {isAssignedToMe ? (
                            <span className="badge badge-emerald font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Your Role ✓</span>
                            </span>
                          ) : isAssignedToOther ? (
                            <span className="badge badge-stone text-[10px] font-bold">
                              Assigned: {roleInfo?.assignedToName || 'Teammate'}
                            </span>
                          ) : isSelected ? (
                            <CheckCircle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <span className="badge badge-stone text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Available
                            </span>
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
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary text-sm py-3 px-6 flex items-center gap-2"
                  >
                    <span>Continue to Device Binding</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Device Binding & Confirmation */}
            {step === 2 && (
              <div className="card p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                    2. Device Binding & Rules Protocol
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Zero One links your operational role to your current workstation session to guarantee integrity.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-orange-500" />
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Device Session Binding ({selectedRole})
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        ID: {deviceId} • Authenticated with Code.SCRIET
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
                    <li>CEO approvals required for market purchases above two-key threshold.</li>
                    <li>Timer and rounds are synchronized centrally with the SCRIET event server.</li>
                    <li>₹10,00,000 startup capital belongs to the team and is managed collectively.</li>
                  </ul>
                </div>

                <div className="flex justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    ← Back to Role Selection
                  </button>

                  <button
                    onClick={handleCompleteOnboarding}
                    disabled={isSubmitting}
                    className="btn-primary text-sm py-3 px-8 flex items-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                  >
                    {joinedSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>Entering Simulation Hub...</span>
                      </>
                    ) : isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Binding Role & Device...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Enter Simulation</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
