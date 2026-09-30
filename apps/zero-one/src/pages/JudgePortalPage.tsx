import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Gavel, CheckCircle, ExternalLink, ShieldAlert, Award } from 'lucide-react';

interface JudgePortalPageProps {
  onNavigate: (view: string) => void;
}

export const JudgePortalPage: React.FC<JudgePortalPageProps> = ({ onNavigate }) => {
  const {
    teams,
    currentTeam,
    setCurrentTeamId,
    judgingCriteria,
    submitJudgeScore,
    currentUser,
    getBalance,
  } = useSimulation();

  const [scores, setScores] = useState<Record<string, number>>({
    'crit-problem': 13,
    'crit-innovation': 14,
    'crit-business': 18,
    'crit-finance': 13,
    'crit-crisis': 14,
    'crit-pitch': 9,
    'crit-feasibility': 9,
  });

  const [feedback, setFeedback] = useState<string>(
    'Strong unit economics and excellent crisis mitigation during competitor price war.'
  );
  const [submitted, setSubmitted] = useState<boolean>(false);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleScoreChange = (critId: string, val: number) => {
    setScores((prev) => ({ ...prev, [critId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitJudgeScore({
      judgeId: currentUser.id,
      judgeName: currentUser.name,
      teamId: currentTeam.id,
      scores,
      feedback,
      totalScore,
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Judge Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                  Judge Scoring Portal
                </h1>
                <p className="text-xs text-stone-500">
                  Evaluating {currentTeam.teamCode} — {currentTeam.name}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Team Switcher for Judges */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400">Team:</span>
            <select
              value={currentTeam.id}
              onChange={(e) => setCurrentTeamId(e.target.value)}
              className="text-xs font-bold py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#12141C]"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamCode} ({t.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Factual Context Box for Judge (Rule 45) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Factual Event Telemetry (Auto-Verified)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-stone-500 block">Available Capital:</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                ₹ {getBalance(currentTeam.id).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Startup Health:</span>
              <span className="font-mono font-bold text-emerald-600">
                {currentTeam.healthScore}%
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Equity Retained:</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                {100 - currentTeam.equitySoldPct}%
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Problem Space:</span>
              <span className="font-bold truncate block text-stone-800 dark:text-stone-200">
                {currentTeam.problemStatement}
              </span>
            </div>
          </div>
        </div>

        {/* Scoring Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
              Evaluation Rubrics (Total 100)
            </h3>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-orange-600 dark:text-orange-500">
                {totalScore}
              </span>
              <span className="text-xs font-bold text-stone-400"> / 100</span>
            </div>
          </div>

          <div className="space-y-4">
            {judgingCriteria.map((crit) => (
              <div key={crit.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-800 dark:text-stone-200">{crit.name}</span>
                  <span className="font-mono text-orange-600 dark:text-orange-400">
                    {scores[crit.id] || 0} / {crit.maxScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={crit.maxScore}
                  value={scores[crit.id] || 0}
                  onChange={(e) => handleScoreChange(crit.id, Number(e.target.value))}
                  className="w-full accent-orange-500 h-2 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Judge Constructive Feedback:
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            {submitted && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Scores locked and submitted!
              </span>
            )}
            <button
              type="submit"
              className="btn-primary py-2.5 px-8 text-xs font-bold shadow-md shadow-orange-500/25 ml-auto"
            >
              Lock & Submit Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
