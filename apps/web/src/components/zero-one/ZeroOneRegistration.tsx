import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { zoStyles } from './zeroOneTheme';

interface ZeroOneRegistrationProps {
  onComplete: (data: {
    fullName: string;
    college: string;
    email: string;
    teamAction: 'create' | 'join';
    teamName: string;
    inviteCode: string;
    role: string;
  }) => Promise<void>;
  initialUser?: { name?: string; email?: string } | null;
  onLoginGoogle?: () => void;
}

export const ZeroOneRegistration: React.FC<ZeroOneRegistrationProps> = ({
  onComplete,
  initialUser,
  onLoginGoogle,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialUser?.email ? 2 : 1);
  const [fullName, setFullName] = useState(initialUser?.name || '');
  const [college, setCollege] = useState('Chaudhary Charan Singh University (SCRIET)');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [teamAction, setTeamAction] = useState<'create' | 'join'>('create');
  const [teamName, setTeamName] = useState('Tech Titans');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState('CEO / Strategy Lead');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as any);
      return;
    }
    // Step 4 final submit
    setLoading(true);
    try {
      await onComplete({
        fullName,
        college,
        email,
        teamAction,
        teamName,
        inviteCode,
        role,
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Team' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Confirm' },
  ];

  return (
    <div className="w-full bg-[#140904] text-[#FFF7ED] py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Stepper matching Panel 7 */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            MISSION ONBOARDING
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-[#FFF7ED]">
            Create Your Mission Profile
          </h1>
          <p className="text-sm text-[#FED7AA]/80">
            Join the ultimate startup simulation event. Build, execute, and scale from ZERO to ONE.
          </p>

          {/* Stepper Pills matching Panel 7 */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                    step === s.num
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#220F06] text-stone-500 border border-amber-500/15'
                  }`}
                >
                  <span>{s.num}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-4 h-px bg-amber-500/30" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Form & Portal Visual matching Panel 7 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#210F06] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-sm font-display font-bold text-amber-300">
                  Step 1 • Founder Identity
                </div>

                {onLoginGoogle && (
                  <button
                    type="button"
                    onClick={onLoginGoogle}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-sm transition-all shadow-md"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}

                <div className="relative flex items-center justify-center my-3">
                  <div className="w-full border-t border-amber-500/20" />
                  <span className="absolute bg-[#210F06] px-3 text-xs font-mono text-[#FED7AA]/50 uppercase">
                    OR REGISTER DETAILS
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aman Gupta"
                      className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1">
                      University / College
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. CCS University / SCRIET"
                      className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@scriet.edu"
                      className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Team */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-display font-bold text-amber-300">
                  Step 2 • Squad Strategy
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTeamAction('create')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      teamAction === 'create'
                        ? 'bg-[#2E1408] border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#180B04] border-amber-500/20 text-stone-400'
                    }`}
                  >
                    <div className="font-bold text-sm text-[#FFF7ED]">Create Team</div>
                    <div className="text-xs text-[#FED7AA]/60 mt-0.5">Found a new squad</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeamAction('join')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      teamAction === 'join'
                        ? 'bg-[#2E1408] border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#180B04] border-amber-500/20 text-stone-400'
                    }`}
                  >
                    <div className="font-bold text-sm text-[#FFF7ED]">Join Team</div>
                    <div className="text-xs text-[#FED7AA]/60 mt-0.5">Use 8-char invite code</div>
                  </button>
                </div>

                {teamAction === 'create' ? (
                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Tech Titans"
                      className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1">
                      Squad Invite Code
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. TECHN001"
                      maxLength={8}
                      className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-[#FFF7ED] uppercase font-mono tracking-wider focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-display font-bold text-amber-300">
                  Step 3 • Founder Role
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-amber-300">
                    Primary Operational Seat
                  </label>
                  {[
                    'CEO / Strategy Lead',
                    'CTO / Technical Architect',
                    'CFO / Financial Strategist',
                    'CMO / Product & Growth',
                  ].map((r) => (
                    <div
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        role === r
                          ? 'bg-[#2E1408] border-amber-400 text-amber-200'
                          : 'bg-[#180B04] border-amber-500/15 text-[#FED7AA]/70'
                      }`}
                    >
                      <span className="text-sm font-medium">{r}</span>
                      {role === r && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-sm font-display font-bold text-amber-300">
                  Step 4 • Verify & Confirm Mission Dossier
                </div>

                <div className="bg-[#180B04] border border-amber-500/20 rounded-2xl p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-amber-500/10">
                    <span className="text-stone-400">Founder:</span>
                    <span className="text-amber-300 font-bold">{fullName || 'Founder'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/10">
                    <span className="text-stone-400">Email:</span>
                    <span className="text-[#FFF7ED]">{email || 'founder@scriet.edu'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/10">
                    <span className="text-stone-400">Squad Action:</span>
                    <span className="text-[#FFF7ED] uppercase">{teamAction}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/10">
                    <span className="text-stone-400">Squad:</span>
                    <span className="text-amber-400 font-bold">
                      {teamAction === 'create' ? teamName : `Code: ${inviteCode}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-400">Seat:</span>
                    <span className="text-emerald-400">{role}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-500/15">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="text-xs text-stone-400 hover:text-white px-3 py-2"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className={zoStyles.btnPrimary}
              >
                <span>{step === 4 ? (loading ? 'Initiating…' : 'Confirm & Enter Arena') : 'Next Step →'}</span>
              </button>
            </div>
          </div>

          {/* Right Founder Portal Visual (5 cols) matching Panel 7 */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#180B04]">
            <img
              src="/zero-one/portal.jpg"
              alt="ZERO → ONE Mission Portal"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140904] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6 right-6 text-center space-y-1">
              <div className="text-xs uppercase font-mono tracking-widest text-amber-300 font-bold">
                ENTER THE PORTAL
              </div>
              <p className="text-xs text-[#FED7AA]/80">
                Thousands of students, different perspectives, one ultimate transformation from ZERO to ONE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
