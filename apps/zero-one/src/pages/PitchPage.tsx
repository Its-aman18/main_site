import React, { useState, useEffect } from 'react';
import { useSimulation } from '../services/simulationContext';
import {
  Mic,
  Video,
  FileText,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Trophy,
  AlertCircle,
  Shield,
  Send,
} from 'lucide-react';

interface PitchPageProps {
  onNavigate: (view: string) => void;
}

export const PitchPage: React.FC<PitchPageProps> = ({ onNavigate }) => {
  const { currentTeam, currentRole } = useSimulation();

  // 2-minute pitch countdown timer
  const [timerSecs, setTimerSecs] = useState<number>(120);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Pitch submission state
  const [pitchDeckUrl, setPitchDeckUrl] = useState<string>('https://drive.google.com/file/d/zero-one-pitch-deck-team07/view');
  const [prototypeUrl, setPrototypeUrl] = useState<string>('https://github.com/scriet-team07/digital-fintech-prototype');
  const [elevatorPitch, setElevatorPitch] = useState<string>(
    'Building decentralized micro-lending infrastructure for student builders with transparent ledger verification and instant credit scoring.'
  );
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timerSecs > 0) {
      interval = setInterval(() => {
        setTimerSecs((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSecs]);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 mb-2">
              <Mic className="w-3.5 h-3.5" />
              <span>Round 4 • Final Shark-Tank Defense</span>
            </div>
            <h1 className="text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
              Pitch & Prototype Submission
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Startup: <strong className="text-stone-800 dark:text-stone-200">Team {currentTeam.name} ({currentTeam.teamCode})</strong> • Defense Role: <strong className="text-orange-600">{currentRole}</strong>
            </p>
          </div>

          <button
            onClick={() => onNavigate('team-dashboard')}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* 2-Minute Defense Live Practice Timer */}
        <div className="card p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <span className="badge badge-orange text-[10px] font-mono uppercase tracking-widest">
                Official Defense Clock
              </span>
              <h2 className="text-2xl font-bold font-heading">
                2-Minute Strict Shark Tank Timer
              </h2>
              <p className="text-xs text-stone-400 max-w-md">
                Judges enforce hard cutoff. Structure your presentation: 45s problem & solution, 45s unit economics, 30s ask & moat.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div
                className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${
                  timerSecs <= 30 ? 'text-red-400 animate-pulse' : 'text-orange-400'
                }`}
              >
                {formatTimer(timerSecs)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 transition-colors"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'Pause' : 'Start Defense'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimerSecs(120);
                  }}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  title="Reset to 120s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pitch Deck & Artifacts Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 card p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <span>Artifacts & Materials</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Pitch Deck URL (Google Slides / Canva / PDF)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={pitchDeckUrl}
                    onChange={(e) => setPitchDeckUrl(e.target.value)}
                    required
                    className="input-text text-xs flex-1"
                    placeholder="https://..."
                  />
                  <a
                    href={pitchDeckUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-orange-500"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Prototype Demo URL / GitHub Repository
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={prototypeUrl}
                    onChange={(e) => setPrototypeUrl(e.target.value)}
                    required
                    className="input-text text-xs flex-1"
                    placeholder="https://..."
                  />
                  <a
                    href={prototypeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-orange-500"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  60-Second Elevator Pitch
                </label>
                <textarea
                  rows={4}
                  value={elevatorPitch}
                  onChange={(e) => setElevatorPitch(e.target.value)}
                  className="input-text text-xs leading-relaxed"
                  placeholder="Explain the problem, your solution, unit economics, and competitive advantage..."
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="btn-primary text-xs font-bold py-3 px-6 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitted ? 'Update Submission' : 'Submit Pitch to Judges'}</span>
                </button>

                {submitted && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Locked & Dispatched to Judges!</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Judge Rubric Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Evaluation Rubric</span>
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { name: 'Problem Validation & Market Size', max: 10, weight: '20%' },
                  { name: 'Unit Economics & Financial Discipline', max: 10, weight: '30%' },
                  { name: 'Crisis Survival & Tradeoffs Made', max: 10, weight: '25%' },
                  { name: 'Final Pitch Delivery & Defense', max: 10, weight: '25%' },
                ].map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">{crit.name}</div>
                      <div className="text-[11px] text-stone-400">Weight: {crit.weight}</div>
                    </div>
                    <div className="font-mono font-black text-orange-600 dark:text-orange-400">
                      / {crit.max}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-xs space-y-2">
              <div className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Angel Judge Panel</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[11px]">
                3 official Code.SCRIET judges and alumni founders evaluate responses live in the Judge Portal. Results feed into the Auditorium Live Screen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
