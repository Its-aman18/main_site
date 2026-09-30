import React, { useState, useEffect } from 'react';
import { useSimulation } from '../services/simulationContext';
import { AlertCircle, Clock, ShieldAlert, CheckCircle, Flame } from 'lucide-react';

interface CrisisModalProps {
  onClose?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ onClose }) => {
  const { activeCrisis, submitCrisisResponse } = useSimulation();

  const [selectedOptionId, setSelectedOptionId] = useState<string>('OPT-1');
  const [tradeoffInput, setTradeoffInput] = useState<string>('Allocated marketing reserves to defend market share');
  const [remainingSecs, setRemainingSecs] = useState<number>(255); // 04:15
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!activeCrisis || activeCrisis.status !== 'ACTIVE') return;
    const interval = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCrisis]);

  if (!activeCrisis) return null;

  const crisis = activeCrisis.crisis;

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitCrisisResponse(selectedOptionId, tradeoffInput);
    if (result.success) {
      setSubmittedMessage(result.message);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    }
  };

  return (
    <div className="card p-6 md:p-8 max-w-4xl mx-auto shadow-2xl border-stone-200 dark:border-stone-800">
      {/* Header bar matching screenshot 5 */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
            Active Crisis
          </h2>
          <span className="badge badge-red flex items-center gap-1 font-bold text-xs animate-pulse">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            URGENT
          </span>
        </div>

        {/* Big Countdown Timer */}
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black font-mono text-red-600 dark:text-red-400">
            {formatTimer(remainingSecs)}
          </div>
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Time Remaining
          </div>
        </div>
      </div>

      {submittedMessage ? (
        <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in zoom-in-95">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            Crisis Response Recorded!
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {submittedMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visual Hero Crisis Card matching screenshot 5 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c120c] via-[#2d1a10] to-[#120a06] text-white p-6 sm:p-8 border border-orange-950/40 shadow-xl">
            {/* Ambient lightning glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {crisis.category}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
                {crisis.title}
              </h3>

              <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
                {crisis.description}
              </p>
            </div>
          </div>

          {/* Option Selector Radio List */}
          <div>
            <label className="block text-sm font-bold text-stone-900 dark:text-stone-100 mb-3">
              Choose your team response:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {crisis.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all flex flex-col justify-between ${
                    selectedOptionId === opt.id
                      ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#12141C]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="crisis-option"
                        value={opt.id}
                        checked={selectedOptionId === opt.id}
                        onChange={() => setSelectedOptionId(opt.id)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {opt.label}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                      Cost: {opt.cost > 0 ? `₹ ${opt.cost.toLocaleString('en-IN')}` : 'No immediate cost'}
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                      {opt.effectDescription}
                    </p>
                  </div>

                  {opt.requiresRoles && (
                    <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-1.5 text-[10px] font-semibold text-stone-400">
                      <span>Requires:</span>
                      {opt.requiresRoles.map((r) => (
                        <span key={r} className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Trade-off explanation field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              What tradeoff did you make? (Scored in Floor Consistency)
            </label>
            <input
              type="text"
              value={tradeoffInput}
              onChange={(e) => setTradeoffInput(e.target.value)}
              placeholder="e.g. Sacrificed short-term product roadmap to shield pricing."
              className="w-full text-sm"
              required
            />
          </div>

          {/* Submit Response CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto py-3 px-8 text-base shadow-lg shadow-orange-500/25"
            >
              Submit Response →
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
