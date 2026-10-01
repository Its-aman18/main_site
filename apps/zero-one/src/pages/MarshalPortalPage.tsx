import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Shield, Smartphone, RefreshCw, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { SimulationRole } from '../types';

interface MarshalPortalPageProps {
  onNavigate: (view: string) => void;
}

export const MarshalPortalPage: React.FC<MarshalPortalPageProps> = ({ onNavigate }) => {
  const { teams, reissueRoleToDevice, logAuditAction } = useSimulation();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-07');
  const [selectedRole, setSelectedRole] = useState<SimulationRole>('CFO');
  const [targetStudentName, setTargetStudentName] = useState<string>('');
  const [reissueSuccessMsg, setReissueSuccessMsg] = useState<string | null>(null);

  const handleReissue = (e: React.FormEvent) => {
    e.preventDefault();
    const success = reissueRoleToDevice(selectedTeamId, selectedRole, targetStudentName);
    if (success) {
      setReissueSuccessMsg(
        `Generated fresh device authorization for ${targetStudentName} as ${selectedRole}. Previous hardware token revoked.`
      );
      setTimeout(() => setReissueSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                Marshal Floor Support
              </h1>
              <p className="text-xs text-stone-500">
                Authorized act-on-behalf and hardware role reissuance
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('team-dashboard')}
            className="btn-secondary py-1.5 px-4 text-xs font-bold"
          >
            Dashboard
          </button>
        </div>

        {/* Reissue Role Form (Rule 14 & Rule 54) */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-orange-500" />
            <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100">
              Hardware Role Conflict Recovery
            </h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            If a participant's device dies, disconnects, or suffers hardware lockup, the Marshal can reissue their role to a new device or scan token immediately.
          </p>

          {reissueSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{reissueSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleReissue} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">Select Squad:</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full text-xs"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamCode} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">Target Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as SimulationRole)}
                className="w-full text-xs"
              >
                <option value="CEO">CEO (Chief Executive)</option>
                <option value="CFO">CFO (Chief Financial)</option>
                <option value="CTO">CTO (Chief Technology)</option>
                <option value="CMO">CMO (Chief Marketing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">Student Name:</label>
              <input
                type="text"
                value={targetStudentName}
                onChange={(e) => setTargetStudentName(e.target.value)}
                className="w-full text-xs"
                required
              />
            </div>

            <div className="sm:col-span-3 pt-2">
              <button
                type="submit"
                className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Authorize & Reissue Role to New Device</span>
              </button>
            </div>
          </form>
        </div>

        {/* Assigned Teams Telemetry Grid */}
        <div className="card p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100">
            Active Assigned Teams
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    {t.name} ({t.teamCode})
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Health: {t.healthScore}% • Status: {t.status}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTeamId(t.id);
                    logAuditAction('MARSHAL_INSPECTED_TEAM', t.teamCode, `Marshal inspected ${t.name}`, 'MARSHAL');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-orange-500"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
